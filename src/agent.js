const request = require('superagent');

// Vars
const owner = 'spring-projects';
const repo = 'spring-boot';
const { username, token } = require('../github-credentials.json');


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

console.log('Getting branches');

/*
getBranches((branches) => {
  console.log(branches);
});
*/

const commitByAuthor = [];

getCommits((commits) => {
  commits.forEach((commit) => {
    const { login } = commit.author;
    if (!(login in commitByAuthor)) {
      commitByAuthor[commit.author.login] = 0;
    }

    commitByAuthor[commit.author.login] += 1;

    //console.log(commit.author.login);
  }, this);
  console.log(commitByAuthor);
  
  /*
  for(key in commitByAuthor){
    console.log(key);
  }*/



});

