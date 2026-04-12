import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

export class ExecutionService {
  async runBuild(projectPath: string, onData: (data: string) => void): Promise<number> {
    return new Promise((resolve) => {
      // Find package manager
      const hasYarn = fs.existsSync(path.join(projectPath, 'yarn.lock'));
      const cmd = hasYarn ? 'yarn' : 'npm';
      const args = ['install'];

      onData(`> Running ${cmd} ${args.join(' ')}...\n`);
      
      const child = spawn(cmd, args, { 
        cwd: projectPath, 
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' }
      });

      child.stdout.on('data', (data) => onData(data.toString()));
      child.stderr.on('data', (data) => onData(data.toString()));

      child.on('close', (code) => {
        onData(`\n> Build cycle completed with code ${code}\n`);
        resolve(code || 0);
      });
    });
  }

  async dockerBuild(projectId: string, projectPath: string, onData: (data: string) => void): Promise<number> {
    return new Promise(async (resolve) => {
      const dockerfilePath = path.join(projectPath, 'Dockerfile');
      
      // Auto-generate a generic Node.js Dockerfile if missing
      if (!fs.existsSync(dockerfilePath)) {
        onData(`> No Dockerfile found. Generating generic Node.js environmental container...\n`);
        const genericDockerfile = `
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
        `;
        await fs.writeFile(dockerfilePath, genericDockerfile.trim());
      }

      const tag = `codesentinel-${projectId}`.toLowerCase();
      const startTime = Date.now();
      onData(`> Building Docker image: ${tag}...\n`);

      const child = spawn('docker', ['build', '-t', tag, '.'], { 
        cwd: projectPath, 
        shell: true 
      });

      child.stdout.on('data', (data) => onData(data.toString()));
      child.stderr.on('data', (data) => onData(data.toString()));

      child.on('close', (code) => {
        const buildTime = Date.now() - startTime;
        onData(`\n> Build completed in ${(buildTime / 1000).toFixed(2)}s\n`);
        resolve(code || buildTime); // Resolving with time if success
      });
    });
  }

  async dockerRun(projectId: string, onData: (data: string) => void): Promise<string> {
    const tag = `codesentinel-${projectId}`.toLowerCase();
    const containerName = `codesentinel-sandbox-${projectId}`;

    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      // Clean up existing container if any
      spawn('docker', ['rm', '-f', containerName], { shell: true }).on('close', () => {
        const child = spawn('docker', ['run', '--name', containerName, '-d', tag], { shell: true });
        
        child.on('close', (code) => {
          if (code === 0) {
            const runTime = Date.now() - startTime;
            onData(`> Sandbox container started in ${(runTime / 1000).toFixed(2)}s: ${containerName}\n`);
            resolve(JSON.stringify({ containerName, runTime }));
          } else {
            reject(new Error(`Docker run failed with code ${code}`));
          }
        });
      });
    });
  }

  async dockerStop(projectId: string) {
    const containerName = `codesentinel-sandbox-${projectId}`;
    return new Promise((resolve) => {
        spawn('docker', ['stop', containerName], { shell: true }).on('close', () => {
            spawn('docker', ['rm', containerName], { shell: true }).on('close', resolve);
        });
    });
  }

  async getDockerStats(projectId: string): Promise<any> {
    const containerName = `codesentinel-sandbox-${projectId}`;
    return new Promise((resolve) => {
      const child = spawn('docker', ['stats', containerName, '--no-stream', '--format', '{"cpu": "{{.CPUPerc}}", "mem": "{{.MemPerc}}", "memUsage": "{{.MemUsage}}"}'], { shell: true });
      
      let output = '';
      child.stdout.on('data', (data) => output += data.toString());
      child.on('close', () => {
        try {
          resolve(JSON.parse(output.trim()));
        } catch {
          resolve({ cpu: '0%', mem: '0%', memUsage: '0B / 0B' });
        }
      });
    });
  }

  async ensureOllamaContainer(): Promise<string> {
    const containerName = 'codesentinel-ai';
    return new Promise((resolve, reject) => {
      // Check if container already exists
      const check = spawn('docker', ['inspect', containerName], { shell: true });
      check.on('close', (code) => {
        if (code === 0) {
          // Exists, make sure it's running
          spawn('docker', ['start', containerName], { shell: true }).on('close', () => resolve('running'));
        } else {
          // Doesn't exist, create and run
          const run = spawn('docker', ['run', '-d', '-v', 'ollama:/root/.ollama', '-p', '11434:11434', '--name', containerName, 'ollama/ollama'], { shell: true });
          run.on('close', (runCode) => {
            if (runCode === 0) resolve('started');
            else reject(new Error('Failed to start Ollama container. Ensure Docker is running.'));
          });
        }
      });
    });
  }

  async pullModelInContainer(model: string, onData?: (data: string) => void): Promise<number> {
    return new Promise((resolve) => {
      const child = spawn('docker', ['exec', 'codesentinel-ai', 'ollama', 'pull', model], { shell: true });
      
      child.stdout.on('data', (data) => onData?.(data.toString()));
      child.stderr.on('data', (data) => onData?.(data.toString()));
      
      child.on('close', (code) => {
        resolve(code || 0);
      });
    });
  }
}
