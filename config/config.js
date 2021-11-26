import fs from 'fs';
import path from 'path';

const __dirname = path.resolve()

const getEnvironmentConfig = () => {
    let node_env = getEnvironment()
    let configFileName = `datasources.${node_env}.json`
    let configPath = path.join(__dirname, configFileName)
    let rawConfig = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(rawConfig)
}

const environmentConfig = getEnvironmentConfig();

function getEnvironment() {
    let node_env = process.env.NODE_ENV || 'local';
    return node_env;
}

export const Db_Url = environmentConfig.mongo.url
