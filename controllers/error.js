module.exports = {
    Index: async (req, res, next) => {
        res.render("error", {
            menuId: ""
        });
    },
}