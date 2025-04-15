const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ProjectAnalyzer = require('./lib/analyzer');

const app = express();
app.use(bodyParser.json());

app.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).send('Missing repoUrl');

  const tempDir = `./temp/${uuidv4()}`;
  await fs.ensureDir(tempDir);

  try {
    await simpleGit().clone(repoUrl, tempDir);
    const analyzer = new ProjectAnalyzer(tempDir);
    const result = analyzer.analyze();
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await fs.remove(tempDir);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
