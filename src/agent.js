const request = require('superagent');

// Vars
const owner = 'spring-projects';
const repo = 'spring-boot';
const { username, token } = require('../github-credentials.json');

const Storage = require('../src/storage');

const githubStorage = new Storage('remij1', token, 'TWEB_Labo1');

// -------- Functions

function getGetRequest(subUrl) {
  const url = `https://api.github.com/repos/${owner}/${repo}/${subUrl}`;

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

function getCommits(done) {
  getGetRequest('commits').end((err, res) => {
    done(res.body);
  });
}

console.log('Getting commits');

const commitsTab = {
  data: [['login', 'taille', 'color', 'message', 'url']],
};

getCommits((commits) => {
  // Pour chaque commit, on récupère l'auteur (commit.author.login), le message
  // (commit.commit.message), l'url html du commit (commit.html_url)

  commits.forEach((commit) => {
    const { login } = commit.author;
    const { message } = commit.commit;
    const htmlUrl = commit.html_url;

    const sizeValue = 1;
    const colorValue = 0;

    const row = [login, sizeValue, colorValue, message, htmlUrl];

    commitsTab.data.push(row);
  }, this);

  // On push sur github
  console.log('Pushing on github');
  githubStorage.publish('docs/repo.json', JSON.stringify(commitsTab), 'new version of repo.json', () => { });
  console.log('repo.json pushed');
});
