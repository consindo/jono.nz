export default {
	tags: [
		"posts"
	],
	"layout": "layouts/post.njk",
	permalink: function ({ date, page }) {
		const title = page.fileSlug
		if (title === undefined) return
		return `/${date.toISOString().split('T')[0].replace(/-/g, '/')}/${this.slugify(title)}/`;
	},
};
