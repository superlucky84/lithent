/*
import process from "node:process";
import fse from "fs-extra";
import stripAnsi from "strip-ansi";
import rm from "rimraf";
import execa from "execa";
import sortPackageJSON from "sort-package-json";
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import arg from 'arg';
import {
  error,
  sleep,
  strip,
  log,
  color,
  isInteractive,
  info,
  toValidProjectName,
} from './utils.js';
import { prompt } from './prompt.js';

const packageManagerExecScript: Record<PackageManager, string> = {
  npm: 'npx',
  yarn: 'yarn',
  pnpm: 'pnpm exec',
  bun: 'bunx',
};

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

interface Context {
  tempDir: string;
  cwd: string;
  interactive: boolean;
  debug: boolean;
  git?: boolean;
  initScript?: boolean;
  initScriptPath: null | string;
  help: boolean;
  install?: boolean;
  showInstallOutput: boolean;
  noMotion?: boolean;
  pkgManager: PackageManager;
  projectName?: string;
  prompt: typeof prompt;
  stdin?: typeof process.stdin;
  stdout?: typeof process.stdout;
  template?: string;
  token?: string;
  versionRequested?: boolean;
  overwrite?: boolean;
}

export async function createRemix(argv: string[]) {
  console.log('3333333');
  const ctx = await getContext(argv);
  console.log('CLI', ctx.help);
  if (ctx.help) {
    printHelp(ctx);
    return;
  }

  let steps = [introStep, projectNameStep];

  try {
    for (let step of steps) {
      await step(ctx);
    }
  } catch (err) {
    if (ctx.debug) {
      console.error(err);
    }
    throw err;
  }
}

async function projectNameStep(ctx: Context) {
  // valid cwd is required if shell isn't interactive
  if (!ctx.interactive && !ctx.cwd) {
    error('Oh no!', 'No project directory provided');
    throw new Error('No project directory provided');
  }

  if (ctx.cwd) {
    await sleep(100);
    info('Directory:', [
      'Using ',
      color.reset(ctx.cwd),
      ' as project directory',
    ]);
  }

  if (!ctx.cwd) {
    let { name } = await ctx.prompt({
      name: 'name',
      type: 'text',
      label: title('dir'),
      message: 'Where should we create your new project?',
      initial: './my-remix-app',
    });
    ctx.cwd = name!;
    ctx.projectName = toValidProjectName(name!);
    return;
  }

  let name = ctx.cwd;
  if (name === '.' || name === './') {
    let parts = process.cwd().split(path.sep);
    name = parts[parts.length - 1];
  } else if (name.startsWith('./') || name.startsWith('../')) {
    let parts = name.split('/');
    name = parts[parts.length - 1];
  }
  ctx.projectName = toValidProjectName(name);
}

async function introStep(ctx: Context) {
  log(
    `\n${color.bgWhite(` ${color.black('Lithent')} `)}  ${color.green(
      color.bold(`v0.0.1`)
    )} ${color.bold("💿 Let's build a better website...")}`
  );

  if (!ctx.interactive) {
    log('');
    info('Shell is not interactive.', [
      `Using default options. This is equivalent to running with the `,
      color.reset('--yes'),
      ` flag.`,
    ]);
  }
}

function title(text: string) {
  return align(color.bgWhite(` ${color.black(text)} `), 'end', 7) + ' ';
}

function align(text: string, dir: 'start' | 'end' | 'center', len: number) {
  let pad = Math.max(len - strip(text).length, 0);
  switch (dir) {
    case 'start':
      return text + ' '.repeat(pad);
    case 'end':
      return ' '.repeat(pad) + text;
    case 'center':
      return (
        ' '.repeat(Math.floor(pad / 2)) + text + ' '.repeat(Math.floor(pad / 2))
      );
    default:
      return text;
  }
}

function printHelp(ctx: Context) {
  // prettier-ignore
  let output = `
${title("create-remix")}

${color.heading("Usage")}:

${color.dim("$")} ${color.greenBright("create-remix")} ${color.arg("<projectDir>")} ${color.arg("<...options>")}

${color.heading("Values")}:

${color.arg("projectDir")}          ${color.dim(`The Remix project directory`)}

${color.heading("Options")}:

${color.arg("--help, -h")}          ${color.dim(`Print this help message and exit`)}
${color.arg("--version, -V")}       ${color.dim(`Print the CLI version and exit`)}
${color.arg("--no-color")}          ${color.dim(`Disable ANSI colors in console output`)}
${color.arg("--no-motion")}         ${color.dim(`Disable animations in console output`)}

${color.arg("--template <name>")}   ${color.dim(`The project template to use`)}
${color.arg("--[no-]install")}      ${color.dim(`Whether or not to install dependencies after creation`)}
${color.arg("--package-manager")}   ${color.dim(`The package manager to use`)}
${color.arg("--show-install-output")}   ${color.dim(`Whether to show the output of the install process`)}
${color.arg("--[no-]init-script")}  ${color.dim(`Whether or not to run the template's remix.init script, if present`)}
${color.arg("--[no-]git-init")}     ${color.dim(`Whether or not to initialize a Git repository`)}
${color.arg("--yes, -y")}           ${color.dim(`Skip all option prompts and run setup`)}
${color.arg("--remix-version, -v")}     ${color.dim(`The version of Remix to use`)}

${color.heading("Creating a new project")}:

Remix projects are created from templates. A template can be:

- a GitHub repo shorthand, :username/:repo or :username/:repo/:directory
- the URL of a GitHub repo (or directory within it)
- the URL of a tarball
- a file path to a directory of files
- a file path to a tarball
${[
  "remix-run/grunge-stack",
  "remix-run/remix/templates/remix",
  "remix-run/examples/basic",
  ":username/:repo",
  ":username/:repo/:directory",
  "https://github.com/:username/:repo",
  "https://github.com/:username/:repo/tree/:branch",
  "https://github.com/:username/:repo/tree/:branch/:directory",
  "https://github.com/:username/:repo/archive/refs/tags/:tag.tar.gz",
  "https://example.com/remix-template.tar.gz",
  "./path/to/remix-template",
  "./path/to/remix-template.tar.gz",
].reduce((str, example) => {
  return `${str}\n${color.dim("$")} ${color.greenBright("create-remix")} my-app ${color.arg(`--template ${example}`)}`;
}, "")}

To create a new project from a template in a private GitHub repo,
pass the \`token\` flag with a personal access token with access
to that repo.

${color.heading("Initialize a project")}:

Remix project templates may contain a \`remix.init\` directory
with a script that initializes the project. This script automatically
runs during \`remix create\`, but if you ever need to run it manually
you can run:

${color.dim("$")} ${color.greenBright("remix")} init
`;

  log(output);
}

async function getContext(argv: string[]): Promise<Context> {
  let flags = arg(
    {
      '--debug': Boolean,
      '--template': String,
      '--token': String,
      '--yes': Boolean,
      '-y': '--yes',
      '--install': Boolean,
      '--no-install': Boolean,
      '--package-manager': String,
      '--show-install-output': Boolean,
      '--init-script': Boolean,
      '--no-init-script': Boolean,
      '--git-init': Boolean,
      '--no-git-init': Boolean,
      '--help': Boolean,
      '-h': '--help',
      '--no-color': Boolean,
      '--no-motion': Boolean,
      '--overwrite': Boolean,
    },
    { argv, permissive: true }
  );

  let {
    '--debug': debug = false,
    '--help': help = false,
    '--template': template,
    '--token': token,
    '--install': install,
    '--no-install': noInstall,
    '--package-manager': pkgManager,
    '--show-install-output': showInstallOutput = false,
    '--git-init': git,
    '--no-init-script': noInitScript,
    '--init-script': initScript,
    '--no-git-init': noGit,
    '--no-motion': noMotion,
    '--yes': yes,
    '--overwrite': overwrite,
  } = flags;

  let cwd = flags['_'][0] as string;
  let interactive = isInteractive();
  let projectName = cwd;

  if (!interactive) {
    yes = true;
  }

  let context: Context = {
    tempDir: path.join(
      await fs.promises.realpath(os.tmpdir()),
      `create-remix--${Math.random().toString(36).substr(2, 8)}`
    ),
    cwd,
    overwrite,
    interactive,
    debug,
    git: git ?? (noGit ? false : yes),
    initScript: initScript ?? (noInitScript ? false : yes),
    initScriptPath: null,
    help,
    install: install ?? (noInstall ? false : yes),
    showInstallOutput,
    noMotion,
    pkgManager: validatePackageManager(
      pkgManager ??
        // npm, pnpm, Yarn, and Bun set the user agent environment variable that can be used
        // to determine which package manager ran the command.
        (process.env.npm_config_user_agent ?? 'npm').split('/')[0]
    ),
    projectName,
    prompt,
    template,
    token,
  };

  return context;
}

function validatePackageManager(pkgManager: string): PackageManager {
  return packageManagerExecScript.hasOwnProperty(pkgManager)
    ? (pkgManager as PackageManager)
    : 'npm';
}
