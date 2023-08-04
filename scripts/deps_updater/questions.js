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

const getCreds = () => {
    return {
        username: 'bohdan_malyshev',
        password: 'ATBBJz4EEChjV7aEmPR9JHYNAvrr5718E2C3',
        workspace: 'develux-test-task',
        repo_slug: 'test_task',
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