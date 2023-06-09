import { DataTypes, Model } from 'sequelize';
import sequelize from '../index';
import { IProjectColumn } from 'database/types';
import ProjectsModel from './projects';
import TasksModel from './tasks';

interface ProjectColumnModel extends Model<IProjectColumn>, IProjectColumn {}

const ProjectColumnsModel = sequelize.define<ProjectColumnModel>('projectColumns', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id',
    },
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

ProjectsModel.hasMany(ProjectColumnsModel, { foreignKey: 'projectId' });
ProjectColumnsModel.belongsTo(ProjectsModel, { foreignKey: 'projectId' });

ProjectColumnsModel.hasMany(TasksModel, { foreignKey: 'projectColumnId' });
TasksModel.belongsTo(ProjectColumnsModel, { foreignKey: 'projectColumnId' });
export default ProjectColumnsModel;
