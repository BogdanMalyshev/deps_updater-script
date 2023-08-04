const { Bitbucket } = require('bitbucket')
const { getCreds, getDependency } = require('./questions')

const { password, repo_slug, username, workspace } = getCreds()

const bitbucket = new Bitbucket({
    auth: { username, password },
})

const createBranch = async (dependency) => {
    const { dependencyName, version } = dependency

    return await bitbucket.refs.createBranch({
        _body: {
            name: `update_dep_${dependencyName}_${version}_${new Date().getTime()}`,
            target: {
                hash: "master",
            }
        },
        repo_slug,
        workspace
    })
}

const loadPackageJson = async (commit) => {
    const { data } = await bitbucket.repositories.readSrc({
        commit,
        path: "package.json",
        repo_slug,
        workspace
    })

    return data
}

const updatePackageJson = async ({ json, dependency }) => {
    const { dependencyName, version } = dependency
    const package = JSON.parse(json)

    const { packageHasDependency, depsKey } =
        (package.dependencies?.[dependencyName] && { packageHasDependency: true, depsKey: "dependencies" }) ||
        (package.devDependencies?.[dependencyName] && { packageHasDependency: true, depsKey: "devDependencies" }) ||
        { packageHasDependency: false, depsKey: null }

    if (packageHasDependency) {
        package[depsKey][dependencyName] = version

        return JSON.stringify(package, null, 2)
    } else {
        throw `Sorry, the dependency object has no field "${dependencyName}"`
    }
}

const createCommit = async ({ json, branchName, dependency }) => {
    const { dependencyName, version } = dependency
    return bitbucket.source.createFileCommit({
        repo_slug,
        workspace,
        _body: {
            branch: branchName,
            message: `Update dependency: ${dependencyName} to ${version} version`,
            "/package.json": json,
        },
    })
}

const createPullRequest = async ({ branchName, dependency }) => {
    const { dependencyName, version } = dependency
    await bitbucket.pullrequests.create({
        _body: {
            title: `Update dependency ${dependencyName} to ${version} version`,
            source: {
                branch: {
                    name: branchName
                }
            },
        },
        repo_slug,
        workspace
    })
}

const updateDep = async () => {
    try {
        const dependency = await getDependency()

        console.log("Loading...")

        const branch = await createBranch(dependency)
        const packageJson = await loadPackageJson(branch.data.target.hash)
        const updatedPackageJson = await updatePackageJson({
            json: packageJson,
            dependency
        })
        await createCommit({
            json: updatedPackageJson,
            branchName: branch.data.name,
            dependency
        })
        await createPullRequest({ branchName: branch.data.name, dependency })

        console.log("Pull request was created successfully")
        process.exit()
    } catch (err) {
        console.error(err)
        process.exit()
    }
}

module.exports = {
    updateDep
}