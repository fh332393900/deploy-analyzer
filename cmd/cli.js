const { program } = require('commander');
const fs = require('fs-extra');
const ProjectAnalyzer = require('./lib/analyzer');

program
  .command('analyze <path>')
  .description('Analyze a local project')
  .action(async (path) => {
    const absolutePath = fs.realpathSync(path);
    const analyzer = new ProjectAnalyzer(absolutePath);
    console.log(JSON.stringify(analyzer.analyze(), null, 2));
  });

program.parse(process.argv);
