import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  exitCode: number;
  traceJson?: Array<{
    action: string;
    indices?: number[];
    data?: unknown;
    [key: string]: unknown;
  }>;
}

export interface ExecutionOptions {
  timeout?: number; // milliseconds
  maxMemory?: number; // MB (not enforced on Windows without Docker)
  input?: string;
}

export class CodeExecutor {
  private tempDir: string;
  private readonly defaultTimeout = 10000; // 10 seconds
  private readonly maxOutputLength = 10000; // characters

  constructor() {
    // Create temp directory for code execution
    this.tempDir = path.join(os.tmpdir(), 'dsa-platform-exec');
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Execute code in the specified language
   */
  async execute(
    code: string,
    language: 'python' | 'cpp' | 'javascript' | 'go',
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Validate code
      if (!code || code.trim().length === 0) {
        throw new Error('Code cannot be empty');
      }

      if (code.length > 100000) {
        throw new Error('Code is too long (max 100KB)');
      }

      // Sanitize code for security
      this.sanitizeCode(code, language);

      // Execute based on language
      let result: ExecutionResult;
      switch (language) {
        case 'python':
          result = await this.executePython(code, options);
          break;
        case 'cpp':
          result = await this.executeCpp(code, options);
          break;
        case 'javascript':
          result = await this.executeJavaScript(code, options);
          break;
        case 'go':
          result = await this.executeGo(code, options);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      result.executionTime = Date.now() - startTime;
      return result;
    } catch (error: any) {
      return {
        output: '',
        error: error.message || 'Execution failed',
        executionTime: Date.now() - startTime,
        exitCode: 1,
      };
    }
  }

  /**
   * Execute Python code
   */
  private async executePython(
    code: string,
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const timeout = options.timeout || this.defaultTimeout;
    const filePath = path.join(this.tempDir, `python_${randomUUID()}.py`);

    try {
      // Write code to file
      await fs.writeFile(filePath, code, 'utf-8');

      // Build command
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      
      // Execute with timeout and input
      const result = await this.executeWithTimeoutAndInput(
        `${pythonCmd} "${filePath}"`,
        options.input || '',
        timeout
      );

      // Clean up
      await this.cleanup(filePath);

      return {
        output: this.truncateOutput(result.stdout),
        error: result.stderr ? this.truncateOutput(result.stderr) : undefined,
        executionTime: 0, // Will be set by caller
        exitCode: result.exitCode || 0,
      };
    } catch (error: any) {
      await this.cleanup(filePath);
      
      if (error.killed || error.signal === 'SIGTERM') {
        return {
          output: '',
          error: 'Execution timed out',
          executionTime: 0,
          exitCode: 124, // Timeout exit code
        };
      }

      throw error;
    }
  }

  /**
   * Compile and execute C++ code
   */
  private async executeCpp(
    code: string,
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const timeout = options.timeout || this.defaultTimeout;
    const sourceFile = path.join(this.tempDir, `cpp_${randomUUID()}.cpp`);
    const executableFile = path.join(this.tempDir, `exe_${randomUUID()}.exe`);

    try {
      // Write code to file
      await fs.writeFile(sourceFile, code, 'utf-8');

      // Detect compiler
      const compiler = await this.detectCppCompiler();

      // Compile
      const compileCommand = compiler === 'g++'
        ? `g++ "${sourceFile}" -o "${executableFile}" -std=c++17 -O2`
        : `cl "${sourceFile}" /Fe:"${executableFile}" /EHsc /std:c++17 /O2`;

      const compileResult = await this.executeWithTimeout(compileCommand, timeout / 2);

      if (compileResult.exitCode !== 0 || compileResult.stderr) {
        await this.cleanup(sourceFile, executableFile);
        return {
          output: '',
          error: compileResult.stderr || 'Compilation failed',
          executionTime: 0,
          exitCode: compileResult.exitCode || 1,
        };
      }

      // Execute
      const execResult = await this.executeWithTimeoutAndInput(
        `"${executableFile}"`,
        options.input || '',
        timeout / 2
      );

      // Clean up
      await this.cleanup(sourceFile, executableFile);

      return {
        output: this.truncateOutput(execResult.stdout),
        error: execResult.stderr ? this.truncateOutput(execResult.stderr) : undefined,
        executionTime: 0,
        exitCode: execResult.exitCode || 0,
      };
    } catch (error: any) {
      await this.cleanup(sourceFile, executableFile);

      if (error.killed || error.signal === 'SIGTERM') {
        return {
          output: '',
          error: 'Execution timed out',
          executionTime: 0,
          exitCode: 124,
        };
      }

      throw error;
    }
  }

  /**
   * Execute JavaScript code (using Node.js)
   */
  private async executeJavaScript(
    code: string,
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const timeout = options.timeout || this.defaultTimeout;
    const filePath = path.join(this.tempDir, `js_${randomUUID()}.js`);

    try {
      // Write code to file
      await fs.writeFile(filePath, code, 'utf-8');

      // Build command and execute with timeout and input
      const result = await this.executeWithTimeoutAndInput(
        `node "${filePath}"`,
        options.input || '',
        timeout
      );

      // Clean up
      await this.cleanup(filePath);

      return {
        output: this.truncateOutput(result.stdout),
        error: result.stderr ? this.truncateOutput(result.stderr) : undefined,
        executionTime: 0,
        exitCode: result.exitCode || 0,
      };
    } catch (error: any) {
      await this.cleanup(filePath);

      if (error.killed || error.signal === 'SIGTERM') {
        return {
          output: '',
          error: 'Execution timed out',
          executionTime: 0,
          exitCode: 124,
        };
      }

      throw error;
    }
  }

  /**
   * Compile and execute Go code
   */
  private async executeGo(
    code: string,
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const timeout = options.timeout || this.defaultTimeout;
    const workDir = path.join(this.tempDir, `go_work_${randomUUID()}`);
    const sourceFile = path.join(workDir, 'main.go');
    const executableFile = path.join(workDir, `main${process.platform === 'win32' ? '.exe' : ''}`);

    try {
      // Check if Go is installed first
      try {
        await execAsync('go version');
      } catch (checkError) {
        return {
          output: '',
          error: `Go compiler is not installed or not in PATH.\n\nTo install Go:\n1. Download from https://golang.org/dl/\n2. Install the Go compiler\n3. Add Go to your system PATH\n4. Restart the backend server\n\nAfter installation, verify with: go version`,
          executionTime: 0,
          exitCode: 1,
        };
      }

      // Create working directory
      await fs.mkdir(workDir, { recursive: true });

      // Write code to file
      await fs.writeFile(sourceFile, code, 'utf-8');

      // Initialize Go module (required for Go 1.11+)
      const initCommand = process.platform === 'win32' 
        ? `cd /d "${workDir}" && go mod init temp_module`
        : `cd "${workDir}" && go mod init temp_module`;
      const initResult = await this.executeWithTimeout(initCommand, 5000);

      if (initResult.exitCode !== 0 || initResult.stderr) {
        await this.cleanupDirectory(workDir);
        const stderr = initResult.stderr || '';
        // Check if it's a "go not found" error (Windows: "not recognized", Unix: "not found")
        if (stderr.includes('go') && (
          stderr.includes('not recognized') || 
          stderr.includes('not found') ||
          stderr.includes('command not found') ||
          stderr.includes('cannot find')
        )) {
          return {
            output: '',
            error: `Go compiler is not installed or not in PATH.\n\nTo install Go:\n1. Download from https://golang.org/dl/\n2. Install the Go compiler\n3. Add Go to your system PATH\n4. Restart the backend server\n\nAfter installation, verify with: go version`,
            executionTime: 0,
            exitCode: 1,
          };
        }
        return {
          output: '',
          error: `Failed to initialize Go module: ${stderr || 'Unknown error'}`,
          executionTime: 0,
          exitCode: initResult.exitCode || 1,
        };
      }

      // Compile Go code
      const compileCommand = process.platform === 'win32'
        ? `cd /d "${workDir}" && go build -o "${executableFile}" main.go`
        : `cd "${workDir}" && go build -o "${executableFile}" main.go`;
      const compileResult = await this.executeWithTimeout(compileCommand, timeout / 2);

      if (compileResult.exitCode !== 0 || compileResult.stderr) {
        await this.cleanupDirectory(workDir);
        return {
          output: '',
          error: compileResult.stderr || 'Compilation failed',
          executionTime: 0,
          exitCode: compileResult.exitCode || 1,
        };
      }

      // Execute
      const execResult = await this.executeWithTimeoutAndInput(
        `"${executableFile}"`,
        options.input || '',
        timeout / 2
      );

      // Clean up
      await this.cleanupDirectory(workDir);

      return {
        output: this.truncateOutput(execResult.stdout),
        error: execResult.stderr ? this.truncateOutput(execResult.stderr) : undefined,
        executionTime: 0,
        exitCode: execResult.exitCode || 0,
      };
    } catch (error: any) {
      await this.cleanupDirectory(workDir);

      if (error.killed || error.signal === 'SIGTERM') {
        return {
          output: '',
          error: 'Execution timed out',
          executionTime: 0,
          exitCode: 124,
        };
      }

      // Check if Go is not installed (Windows and Unix error messages)
      const errorMsg = error.message || error.stderr || '';
      if (errorMsg.includes('go') && (
        errorMsg.includes('not recognized') ||
        errorMsg.includes('not found') ||
        errorMsg.includes('cannot find') ||
        errorMsg.includes('ENOENT') ||
        errorMsg.includes('command not found')
      )) {
        return {
          output: '',
          error: `Go compiler is not installed or not in PATH.\n\nTo install Go:\n1. Download from https://golang.org/dl/\n2. Install the Go compiler\n3. Add Go to your system PATH\n4. Restart the backend server\n\nAfter installation, verify with: go version`,
          executionTime: 0,
          exitCode: 1,
        };
      }

      throw error;
    }
  }

  /**
   * Clean up directory recursively
   */
  private async cleanupDirectory(dir: string): Promise<void> {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          await this.cleanupDirectory(filePath);
        } else {
          await fs.unlink(filePath).catch(() => {});
        }
      }
      await fs.rmdir(dir).catch(() => {});
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Execute command with timeout
   */
  private async executeWithTimeout(
    command: string,
    timeout: number
  ): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
    return new Promise((resolve, reject) => {
      const child = exec(command, {
        timeout,
        maxBuffer: 1024 * 1024, // 1MB buffer
        killSignal: 'SIGTERM',
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Execute command with timeout and input
   */
  private async executeWithTimeoutAndInput(
    command: string,
    input: string,
    timeout: number
  ): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [], {
        shell: true,
        timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout | null = null;

      // Set timeout
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Execution timed out'));
      }, timeout);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
        });
      });

      child.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      });

      // Write input to stdin
      if (input && child.stdin) {
        child.stdin.write(input, 'utf-8');
        child.stdin.end();
      } else if (child.stdin) {
        child.stdin.end();
      }
    });
  }

  /**
   * Detect available C++ compiler
   */
  private async detectCppCompiler(): Promise<'g++' | 'cl'> {
    try {
      // Try g++ first (MinGW or WSL)
      await execAsync('g++ --version');
      return 'g++';
    } catch {
      try {
        // Try MSVC cl.exe
        await execAsync('cl');
        return 'cl';
      } catch {
        throw new Error(
          'No C++ compiler found. Please install MinGW (g++) or Visual Studio Build Tools (cl.exe)'
        );
      }
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanup(...files: (string | null)[]): Promise<void> {
    for (const file of files) {
      if (file) {
        try {
          await fs.unlink(file).catch(() => {
            // Ignore errors if file doesn't exist
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  }

  /**
   * Truncate output if too long
   */
  private truncateOutput(output: string): string {
    if (output.length > this.maxOutputLength) {
      return output.substring(0, this.maxOutputLength) + '\n... (output truncated)';
    }
    return output;
  }

  /**
   * Sanitize code to prevent dangerous operations
   */
  private sanitizeCode(code: string, language: string): string {
    // Block dangerous operations
    const dangerousPatterns: { [key: string]: RegExp[] } = {
      python: [
        /import\s+os\s*$/m,
        /import\s+subprocess\s*$/m,
        /import\s+sys\s*$/m,
        /__import__/,
        /eval\(/,
        /exec\(/,
        /open\(['"]\/etc\//,
        /open\(['"]\/proc\//,
      ],
      cpp: [
        /#include\s*<windows\.h>/,
        /#include\s*<process\.h>/,
        /system\(/,
        /exec\(/,
        /CreateProcess/,
        /ShellExecute/,
      ],
      javascript: [
        /require\(['"]child_process['"]/,
        /require\(['"]fs['"]/,
        /exec\(/,
        /spawn\(/,
        /eval\(/,
        /Function\(/,
      ],
      go: [
        /os\.Exec/,
        /os\.StartProcess/,
        /exec\.Command/,
        /syscall\./,
        /unsafe\./,
        /reflect\./,
        /runtime\./,
        /C\./,
        /import\s+_?\s*["']C["']/,
        /import\s+unsafe/,
        /import\s+syscall/,
      ],
    };

    const patterns = dangerousPatterns[language] || [];
    for (const pattern of patterns) {
      if (pattern.test(code)) {
        throw new Error(`Dangerous code detected: ${pattern}`);
      }
    }

    return code;
  }
}

// Export singleton instance
export const codeExecutor = new CodeExecutor();

