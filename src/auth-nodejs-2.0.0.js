import level from 'level';
import promptSync from 'prompt-sync';
import chalk from 'chalk';
import crypto from 'crypto';

const prompt = promptSync();
const version = '2.0.0';
const hash = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');

async function main() {
  console.log(chalk.green(`\nAuth v${version}`));

  global.db = level('./database', (err) => {
    if (err) {
      console.log(
        chalk.red(`\nThere was an error while initializing the database.\n`),
      );
      throw err;
    }
  });

  while (true) {
    await chooseNextAction();
  }
}

async function chooseNextAction() {
  console.log(chalk.blue('\nChoose an action ( signup, signin, exit )'));
  const action = prompt('');

  switch (action) {
    case 'signup':
      await signUpAction();
      break;
    case 'signin':
      await signInAction();
      break;
    case 'exit':
      process.exit();
      break;
    default:
      console.log(chalk.red('Action not recognized, please try again!'));
  }
}

async function signUpAction() {
  console.log(chalk.blue('\nSign Up'));
  const username = prompt('username: ');
  const password = prompt('password: ');

  if (!username || !password) {
    console.log(
      chalk.red(
        '\nThere was some error while reading the inputs! If you did enter inputs, please check the code!\n',
      ),
    );
    process.exit();
  }
  await global.db.put(username, hash(password));
}

async function signInAction() {
  console.log(chalk.blue('\nSign In'));
  const username = prompt('username: ');
  const password = prompt('password: ');

  if (!username || !password) {
    console.log(
      chalk.red(
        '\nThere was some error while reading the inputs! If you did enter inputs, please check the code!\n',
      ),
    );
    process.exit();
  }

  (await global.db.get(username).catch(() => undefined)) === hash(password)
    ? console.log(chalk.green('\nUser recognized'))
    : console.log(chalk.red('\nUser not recognized'));
}

main();
