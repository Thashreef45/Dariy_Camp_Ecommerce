// Id generator for orders
function idGenerator() {
    let idGenerator = Math.random() * 1000000000000
    idGenerator = String(Math.trunc(idGenerator))
    idGenerator = idGenerator.slice(1, 11)
    return idGenerator
}

module.exports = idGenerator

