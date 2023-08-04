process.stdin.setEncoding('utf8')

// TODO: rewrite this to readline questions
const asyncQuestion = async (question) => {
    return new Promise((res, rej) => {
        console.log(question)
        process.stdin.on('data', (input) => {
            const answer = input.trim()
            if (answer) {
                res(answer)
            } else {
                rej("No entered data...")
            }
        });
    })
}

// TODO: rewrite this to readline questions
const getCreds = async () => {
    const username = await asyncQuestion("Enter a bitbucket username")
    const password = await asyncQuestion("Enter a bitbucket password")
    const workspace = await asyncQuestion("Enter a bitbucket workspace")
    const repo_slug = await asyncQuestion("Enter a bitbucket repo_slug")

    return {
        username,
        password,
        workspace,
        repo_slug
    }
}

const getDependency = async () => {
    const dependencyName = await asyncQuestion("Enter a dependency name")
    const version = await asyncQuestion("Enter a dependency version")

    return { dependencyName, version }
}

module.exports = {
    getCreds,
    getDependency
}