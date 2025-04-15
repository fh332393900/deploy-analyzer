const path = require('path');
const fs = require('fs-extra');
const { globSync } = require('glob');

class ProjectAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.packageJson = this._getPackageJson();
  }

  _getPackageJson() {
    try {
      return fs.readJsonSync(path.join(this.projectPath, 'package.json'));
    } catch (e) {
      return null;
    }
  }

  detectFramework() {
    const files = globSync('**', { cwd: this.projectPath, nodir: true });
    
    if (files.includes('nuxt.config.js') || files.includes('nuxt.config.ts')) return 'nuxt';
    if (files.includes('next.config.js') || files.includes('next.config.ts')) return 'next';
    if (files.includes('vue.config.js')) return 'vue';
    if (this.packageJson?.dependencies?.react) return 'react';
    if (this.packageJson?.dependencies?.express) return 'node';
    return 'unknown';
  }

  detectPackageManager() {
    const files = globSync('**', { cwd: this.projectPath });
    if (files.includes('pnpm-lock.yaml')) return 'pnpm';
    if (files.includes('yarn.lock')) return 'yarn';
    if (files.includes('package-lock.json')) return 'npm';
    return 'npm'; // default
  }

  getNodeVersion() {
    const nvmrc = path.join(this.projectPath, '.nvmrc');
    if (fs.existsSync(nvmrc)) {
      return fs.readFileSync(nvmrc, 'utf8').trim();
    }
    
    if (this.packageJson?.engines?.node) {
      return this.packageJson.engines.node.replace('^', '');
    }
    
    return '18'; // default to LTS
  }

  getBuildCommands() {
    const framework = this.detectFramework();
    const commands = {
      build: this.packageJson?.scripts?.build || null,
      start: this.packageJson?.scripts?.start || null
    };

    if (!commands.build) {
      switch(framework) {
        case 'vue': commands.build = 'vue-cli-service build'; break;
        case 'react': commands.build = 'react-scripts build'; break;
        case 'nuxt': commands.build = 'nuxt build'; break;
        case 'next': commands.build = 'next build'; break;
      }
    }

    return commands;
  }

  generateDockerfile() {
    const framework = this.detectFramework();
    const pm = this.detectPackageManager();
    const nodeVersion = this.getNodeVersion();
    const commands = this.getBuildCommands();

    let installCmd = 'npm install';
    let buildCmd = commands.build;
    let startCmd = commands.start;

    switch(pm) {
      case 'yarn': 
        installCmd = 'yarn install --frozen-lockfile';
        break;
      case 'pnpm':
        installCmd = 'pnpm install --frozen-lockfile';
        break;
    }

    let dockerfile = `FROM node:${nodeVersion}-alpine\n`;
    dockerfile += 'WORKDIR /app\n';
    dockerfile += 'COPY package* ./\n';
    dockerfile += `RUN ${installCmd}\n`;
    dockerfile += 'COPY . .\n';
    dockerfile += `RUN ${buildCmd}\n`;

    switch(framework) {
      case 'nuxt':
        dockerfile += 'EXPOSE 3000\n';
        dockerfile += 'ENV HOST=0.0.0.0\n';
        dockerfile += 'CMD ["npm", "start"]';
        break;
      case 'next':
        dockerfile += 'EXPOSE 3000\n';
        dockerfile += 'CMD ["npm", "start"]';
        break;
      default:
        dockerfile += 'EXPOSE 8080\n';
        dockerfile += `CMD ${JSON.stringify(startCmd.split(' '))}`;
    }

    return dockerfile;
  }

  analyze() {
    return {
      framework: this.detectFramework(),
      packageManager: this.detectPackageManager(),
      nodeVersion: this.getNodeVersion(),
      commands: this.getBuildCommands(),
      dockerfile: this.generateDockerfile()
    };
  }
}

module.exports = ProjectAnalyzer;
