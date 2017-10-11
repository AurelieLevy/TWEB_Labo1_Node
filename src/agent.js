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

function getBranches(done) {
  getGetRequest('branches').end((err, res) => {
    done(res.body);
  });
}

function getCommit(sha, done) {
  getGetRequest(`commits/${sha}`).end((err, res) => {
    done(res.body);
  });
}

function getCommits(done) {
  getGetRequest('commits').end((err, res) => {
    done(res.body);
  });
}

console.log('Getting commits');

const commitByAuthor = {};

getCommits((commits) => {
  // Pour chaque commits, on regarde l'auteur et on compte le nombre de commit total
  commits.forEach((commit) => {
    const { login } = commit.author;
    if (!(login in commitByAuthor)) {
      commitByAuthor[commit.author.login] = 0;
    }

    commitByAuthor[commit.author.login] += 1;
  }, this);

  //On push sur github
  console.log('Pushing on github');  
  githubStorage.publish('docs/repo.json', JSON.stringify(commitByAuthor), 'new version of repo', (err, result) => {
  }); 
});
