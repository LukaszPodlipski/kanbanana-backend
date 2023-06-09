import fs from 'fs';
import csv from 'csv-parser';
import sequelize from '../index';

import { hashPassword } from '../../controllers/utils/index';

import UsersModel from '../models/users';
import ProjectsModel from '../models/projects';
import ProjectUsersModel from '../models/projectUsers';
import ProjectColumnsModel from '../models/projectColumns';
import TasksModel from '../models/tasks';

import { User, Project, ProjectUser, ProjectColumn, Task } from '../types/index';

const seeds = [
  {
    name: 'Users',
    model: UsersModel,
    data: './database/seed/data/users.csv',
    dataModel: (row) => new User(row),
  },
  {
    name: 'Projects',
    model: ProjectsModel,
    data: './database/seed/data/projects.csv',
    dataModel: (row) => new Project(row),
  },
  {
    name: 'ProjectUsers',
    model: ProjectUsersModel,
    data: './database/seed/data/projectUsers.csv',
    dataModel: (row) => new ProjectUser(row),
  },
  {
    name: 'ProjectColumns',
    model: ProjectColumnsModel,
    data: './database/seed/data/projectColumns.csv',
    dataModel: (row) => new ProjectColumn(row),
  },
  {
    name: 'Tasks',
    model: TasksModel,
    data: './database/seed/data/tasks.csv',
    dataModel: (row) => new Task(row),
  },
];

async function seedModel(seed) {
  const stream = fs.createReadStream(seed.data);

  return new Promise<void>((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', async (row) => {
        const data = row.password ? { ...row, password: await hashPassword(row.password) } : row;
        await seed.model.create(seed.dataModel(data));
      })
      .on('end', () => {
        if (!global.isTest) console.log(`[Database] ${seed.name} file successfully processed`);
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export async function seedDatabase() {
  for (const seed of seeds) {
    const tableName = seed.model.getTableName();
    await sequelize.query(`ALTER TABLE "${tableName}" DISABLE TRIGGER ALL`); //  disables all triggers (including foreign key constraints) for the table being seeded
    await seedModel(seed);
    await sequelize.query(`ALTER TABLE "${tableName}" ENABLE TRIGGER ALL`);
  }
}

export const dropDatabase = async () => {
  try {
    await sequelize.query('DROP SCHEMA public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    if (!global.isTest) console.log('[Database] Schema dropped and created successfully');
  } catch (error) {
    console.error(error);
  }
};
