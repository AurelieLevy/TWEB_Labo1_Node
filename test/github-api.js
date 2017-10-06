const chai = require('chai');
const request = require('superagent');
const { username, token } = require('../github-credentials.json');

const should = chai.should();

describe('The github API', () => {
  it('allows me to get a list of pull requests', (done) => {
    const owner = 'spring-projects';
    const repo = 'spring-boot';
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    request
      .get(url)
      .auth(username, token)
      .set('Accept', 'application/vnd.github.v3+json')
      .end((err, res) => {
        should.not.exist(err);
        should.exist(res);
        done();
      });
  });
});

