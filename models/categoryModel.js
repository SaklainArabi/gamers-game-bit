const { query } = require('../config/db');

const CategoryModel = {
    async getAll() {
        return query('SELECT * FROM Game_Category ORDER BY name');
    },

    async create(name, description, icon) {
        return query(
            'INSERT INTO Game_Category (name, description, icon) VALUES (?, ?, ?)',
            [name.trim(), description || null, icon || 'fa-gamepad']
        );
    },

    async deleteCategory(categoryId) {
        return query('DELETE FROM Game_Category WHERE category_id = ?', [categoryId]);
    },

    async getCount() {
        return query('SELECT COUNT(*) as count FROM Game_Category');
    }
};

module.exports = CategoryModel;
