const request = require('superagent');

// Vars
const owner = 'ArdentDiscord';
const repo = 'ArdentKotlin';
const { username, token } = require('../github-credentials.json');

const Storage = require('../src/storage');

const githubStorage = new Storage('remij1', token, 'TWEB_Labo1');

// -------- Functions

function getGetRequest(subUrl, page = 1) {
  const url = `https://api.github.com/repos/${owner}/${repo}/${subUrl}?page=${page}&per_page=100`;

  return request
    .get(url)
    .auth(username, token)
    .set('Accept', 'application/vnd.github.v3+json');
}

/*
function getBranches(done) {
  getGetRequest('branches').end((err, res) => {
    done(res.body);
  });
}

function getCommit(sha, done) {
  getGetRequest(`commits/${sha}`).end((err, res) => {
    done(res.body);
  });
} // */

function getCommits(done, page = 1) {
  let commits = [];

  getGetRequest('commits', page).end((err, res) => {
    commits = commits.concat(res.body);
    if (res.links.next) { // Il y a une page suivante
      getCommits((retCommits) => { // Appel récursif pour les pages suivantes
        commits = commits.concat(retCommits);
        done(commits);
      }, page + 1);
    } else {
      done(commits);
    }
  });
}

console.log('Getting commits');

const commitsTab = {
  data: [
    ['name', 'parent', 'size', 'color', 'url'],
    ['Global', null, 0, 0, '']],
};
const authorTab = [];

getCommits((commits) => {
  // Pour chaque commit, on récupère l'auteur (commit.author.login), le message
  // (commit.commit.message), l'url html du commit (commit.html_url)

  commits.forEach((commit) => {
    const { login } = commit.committer;
    const { message } = commit.commit;
    const htmlUrl = commit.html_url;

    const sizeValue = 1;
    const colorValue = 0;

    const row = [message, login, sizeValue, colorValue, htmlUrl];

    commitsTab.data.push(row);

    // Ajout aux auteurs pour récupérer la liste des auteurs globals
    authorTab[login] = login;
  }, this);

  // On ajoute les auteurs en tant que groupes sous-global
  Object.keys(authorTab).forEach((key) => {
    commitsTab.data.splice(2, 0, [key, 'Global', 0, 0, '']);
  });

  // On push sur github
  console.log('Pushing on github');
  githubStorage.publish('docs/repo.json', JSON.stringify(commitsTab), 'new version of repo.json', () => { });
  console.log('repo.json pushed');
});
