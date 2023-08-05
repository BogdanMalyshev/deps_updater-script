const createBranch = async ({ repo_slug, workspace, dependency }) => {
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

const loadPackageJson = async ({ commit, repo_slug, workspace }) => {
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

    //TODO: add error handler, parser can be crash
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

const createCommit = async ({ json, branchName, dependency, repo_slug, workspace }) => {
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

const createPullRequest = async ({ branchName, dependency, repo_slug, workspace }) => {
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

const updateDep = async ({ repo_slug, workspace, dependency }) => {
    console.log("Loading...")

    //TODO: add errors handlers on all bitbucket responses
    const branch = await createBranch({ dependency, repo_slug, workspace })
    const packageJson = await loadPackageJson({ commit: branch.data.target.hash, repo_slug, workspace })
    const updatedPackageJson = await updatePackageJson({ json: packageJson, dependency, repo_slug, workspace })
    await createCommit({
        json: updatedPackageJson,
        branchName: branch.data.name,
        dependency,
        repo_slug,
        workspace
    })
    await createPullRequest({ branchName: branch.data.name, dependency, repo_slug, workspace })

    console.log("Pull request was created successfully")
}

module.exports = {
    updateDep
}