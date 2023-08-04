const { Bitbucket } = require('bitbucket')
const { updateDep } = require('./deps_updater')
const { getCreds, getDependency } = require('./questions')

async function run() {
    try {
        const { password, username, repo_slug, workspace } = await getCreds()
        const dependency = await getDependency()

        // TODO: refactor this code
        this.bitbucket = new Bitbucket({
            auth: { username, password },
        })

        updateDep({ repo_slug, workspace, dependency })
        process.exit()
    } catch (err) {
        console.error(err)
        process.exit()
    }
}

run()