import level from 'level';
import promptSync from 'prompt-sync';
import chalk from 'chalk';
import bcrypt from 'bcrypt';

const pepper = '$5$%@98gHk14*(lK';
const prompt = promptSync();
const version = '6.0.0';
const saltRounds = 14;
const hash = async (pwd) => {
  return await bcrypt.hash(pwd, saltRounds).catch((err) => {
    console.log(
      chalk.red(
        '\nThere was an error while hashing the password, please check the code or try again!\n',
      ),
    );

    throw err;
  });
};

async function main() {
  console.log(chalk.green(`\nAuth v${version}`));

  global.db = level('./database', { valueEncoding: 'json' }, (err) => {
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

  // Store username, salt and password in the database
  await global.db.put(username, await hash(password + pepper));
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

  // Check if the user exists and if the password is correct
  (await bcrypt
    .compare(
      password + pepper,
      await global.db.get(username).catch(() => undefined),
    )
    .catch(() => undefined))
    ? console.log(chalk.green('\nUser recognized'))
    : console.log(chalk.red('\nUser not recognized'));
}

main();
