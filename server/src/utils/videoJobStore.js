import crypto from "crypto";

const jobs = new Map();
const JOB_TTL_MS = 1000 * 60 * 60 * 6;

const withTimestamps = (job) => ({
    ...job,
    createdAt: job.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

export const createVideoJob = (job) => {
    const jobId = crypto.randomUUID();
    jobs.set(jobId, withTimestamps({ ...job, jobId }));
    return jobs.get(jobId);
};

export const getVideoJob = (jobId) => jobs.get(jobId) || null;

export const updateVideoJob = (jobId, updates) => {
    const current = jobs.get(jobId);

    if (!current) {
        return null;
    }

    const next = withTimestamps({
        ...current,
        ...updates,
    });

    jobs.set(jobId, next);
    return next;
};

export const pruneExpiredVideoJobs = () => {
    const now = Date.now();

    for (const [jobId, job] of jobs.entries()) {
        const updatedAt = new Date(job.updatedAt || job.createdAt).getTime();

        if (Number.isNaN(updatedAt) || now - updatedAt > JOB_TTL_MS) {
            jobs.delete(jobId);
        }
    }
};
