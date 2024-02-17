const axios = require('axios');

class GitHubFileUpdater {
    constructor() {
        this.token = process.env.GITHUB_TOKEN
        this.owner = 'lunDreame';
        this.repo = 'user-bambulab-firmware';
        this.filePath = '/assets/{}_AMS.json';
        this.branch = 'main';
        this.headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
        };
    }

    async updateFile(printerSerial, currentVersion) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${this.owner}/${this.repo}/contents${this.filePath.replace('{}', printerSerial)}?ref=${this.branch}`, { headers: this.headers });
            const fileData = response.data;
            const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
            const sha = fileData.sha;

            const jsonData = JSON.parse(currentContent);

            if (jsonData.upgrade.firmware_optional.firmware.version < currentVersion.firmware[0].version) {
                Object.assign(jsonData.upgrade.firmware_optional, { 'firmware': currentVersion.firmware[0], 'ams': currentVersion.ams });

                const updateData = {
                    message: `[GITHUB API] ${printerSerial}_AMS.json ${currentVersion.firmware[0].version} Update`,
                    content: Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64'),
                    sha: sha,
                    branch: this.branch
                };

                const updateResponse = await axios.put(`https://api.github.com/repos/${this.owner}/${this.repo}/contents${this.filePath.replace('{}', printerSerial)}`, updateData, { headers: this.headers });
                return { success: true, message: 'File updated successfully. Thank you', data: /*updateResponse.data*/{} };
            } else {
                return { success: true, message: `No files to update. ${currentVersion.firmware[0].version}`, data: {} };
            }
        } catch (error) {
            return { success: false, message: `${error.message}`, data: {} };
        }
    }
}

module.exports = new GitHubFileUpdater();