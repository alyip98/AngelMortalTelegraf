let cbs = []

module.exports = {
    onModelReload: function(cb) {
        cbs.push(cb)
    },
    triggerReloadModel: function () {
        cbs.forEach(cb => cb())
    }
}