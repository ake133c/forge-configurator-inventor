import * as signalR from '@aspnet/signalr';
import repo from './Repository';

class JobManager {
    constructor() {
        this.jobs = new Map();
    }

    async startConnection() {
        const connection = new signalR.HubConnectionBuilder()
        .withUrl('/signalr/connection')
        .configureLogging(signalR.LogLevel.Trace)
        .build();

        await connection.start();
        return connection;
    }

    async doUpdateJob(projectId, parameters, onStart, onComplete) {
        const connection = await this.startConnection();

        if (onStart)
            onStart();

        connection.on("onComplete", (updatedState) => {
            // stop connection
            connection.stop();

            if (onComplete)
                onComplete(updatedState);
        });

        await connection.invoke('CreateUpdateJob', projectId, parameters, repo.getAccessToken());
    }

    async doRFAJob(projectId, hash, onStart, onComplete) {
        const connection = await this.startConnection();

        if (onStart)
            onStart();

        connection.on("onComplete", (rfaUrl) => {
            // stop connection
            connection.stop();

            if (onComplete)
                onComplete(rfaUrl);
        });

        await connection.invoke('CreateRFAJob', projectId, hash, repo.getAccessToken());
    }
}

const jobManager = new JobManager();

export function Jobs() {
  return jobManager;
}


