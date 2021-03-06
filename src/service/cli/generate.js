'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);
const {ExitCode} = require(`../../constants`);
const {getRandomInt, shuffle, getRandomRange} = require(`../../utils`);

const MAX_ID_LENGTH = 6;
const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;
const MAX_SENTENCES = 5;
const MAX_CATEGORIES = 3;
const MAX_COMMENTS = 2;
const FILE_NAME = `mocks.json`;
const DATA_DIR = `data`;

const PRICE = {
  MIN: 1000,
  MAX: 100000,
};

const TYPE = {
  OFFER: `offer`,
  SALE: `sale`,
};

const PIC_NUMBER = {
  MIN: 1,
  MAX: 16,
};

let categories;
let titles;
let sentences;
let comments;

const getPictureFileName = () =>
  `item${(`0` + getRandomInt(PIC_NUMBER.MIN, PIC_NUMBER.MAX)).slice(-2)}.jpg`;

const getType = () => {
  const types = Object.keys(TYPE);

  return TYPE[types[getRandomInt(0, types.length)]];
};

const generateComments = (count) =>
  Array(count)
    .fill(1)
    .map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      text: shuffle(comments).slice(0, getRandomInt(1, 3)).join(` `),
    }));

const generateOffers = (count) =>
  Array(count)
    .fill(1)
    .map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      title: titles[getRandomInt(0, titles.length - 1)],
      picture: getPictureFileName(),
      description: getRandomRange(shuffle(sentences), MAX_SENTENCES).join(` `),
      type: getType(),
      sum: getRandomInt(PRICE.MIN, PRICE.MAX),
      category: getRandomRange(shuffle(categories), MAX_CATEGORIES),
      comments: generateComments(getRandomInt(1, MAX_COMMENTS)),
    }));

const getData = async (fileName) => {
  const lines = (await fs.readFile(fileName, `utf-8`)) || ``;
  return lines.split(`\n`).filter((v) => v);
};

module.exports = {
  name: `--generate`,
  async run(args) {
    const [countArg] = args;
    const offersCount = Number.parseInt(countArg, 10) || DEFAULT_COUNT;

    if (offersCount > MAX_COUNT) {
      console.info(chalk.blue(`Не больше 1000 объявлений`));
      process.exit(ExitCode.success);
    }

    try {
      categories = await getData(`${DATA_DIR}/categories.txt`);
      titles = await getData(`${DATA_DIR}/titles.txt`);
      sentences = await getData(`${DATA_DIR}/sentences.txt`);
      comments = await getData(`${DATA_DIR}/comments.txt`);
    } catch (e) {
      console.error(chalk.red(`Не удалось считать данные из файлов...`));
      console.error(chalk.red(`Ошибка: ${e.message}`));
      process.exit(ExitCode.error);
    }

    const data = JSON.stringify(generateOffers(offersCount));
    try {
      await fs.writeFile(FILE_NAME, data);
      console.info(chalk.green(`Данные записаны в файл mocks.json`));
    } catch (e) {
      console.error(chalk.red(`Не удалось записать данные в файл...`));
      console.error(chalk.red(`Ошибка: ${e.message}`));
      process.exit(ExitCode.error);
    }
  },
};
