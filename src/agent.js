const request = require('superagent');
const fs = require('fs');
const path = require('path');

// Vars
const owner = 'ArdentDiscord';
const repo = 'ArdentKotlin';
const Storage = require('../src/storage');

// Credentials
/* On utilise par défaut les variables d'environnement définissant username et password.
 * Si elles n'existent pas, on utilise le fichier json
 * Pour ajouter des variables d'environnement à Heroku:
 * heroku config:set username=user12 token=asdvbixwwe -a tweb-tree
 */
let { username, token } = process.env;

if (!username || !token) { // Si les variables d'environnement n'existent pas
  // On utilise fs plutôt qu'un require, car un require doit être global selon les normes airbnb
  const jsonCredentials = JSON.parse(fs.readFileSync(path.join(__dirname, '../github-credentials.json'), 'utf8'));
  console.log('No enviromment variable found (username, token), using json "github-credentials"');
  ({ username, token } = jsonCredentials);
}

const githubStorage = new Storage('remij1', token, 'TWEB_Labo1');

// -------- Functions

function getGetRequest(subUrl, page = 1) {
  const url = `https://api.github.com/repos/${owner}/${repo}/${subUrl}?page=${page}&per_page=100`;

  return request
    .get(url)
    .auth(username, token)
    .set('Accept', 'application/vnd.github.v3+json');
}

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
    ['name', 'parent', 'size', 'color', 'date', 'message', 'url'],
    ['Global', null, 0, 0, '', '', '']],
};
const authorTab = [];

getCommits((commits) => {
  // Pour chaque commit, on récupère l'auteur (commit.author.login), le message
  // (commit.commit.message), l'url html du commit (commit.html_url),
  // la date (commit.commit.author.date)

  commits.forEach((commit) => {
    const { login } = commit.committer;
    const { message } = commit.commit;
    const { date } = commit.commit.author;
    const htmlUrl = commit.html_url;
    const { sha } = commit;

    const dateObject = new Date(date);
    const time = dateObject.getTime();

    const sizeValue = 1;
    const colorValue = time;

    const row = [sha, login, sizeValue, colorValue, date, message, htmlUrl];

    commitsTab.data.push(row);

    // Ajout aux auteurs pour récupérer la liste des auteurs globals
    authorTab[login] = login;
  }, this);

  // On ajoute les auteurs en tant que groupes sous-global
  Object.keys(authorTab).forEach((key) => {
    commitsTab.data.splice(2, 0, [key, 'Global', 0, 0, '', '', '']);
  });

  // On push sur github
  console.log('Pushing on github');
  githubStorage.publish('docs/repo.json', JSON.stringify(commitsTab), 'new version of repo.json', () => { });
  console.log('repo.json pushed');
});
