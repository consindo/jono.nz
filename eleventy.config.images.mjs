import path from 'path'
import eleventyImage from '@11ty/eleventy-img'

export function relativeToInputPath(inputPath, relativeFilePath) {
	let split = inputPath.split("/")
	split.pop()

	return path.resolve(split.join(path.sep), relativeFilePath)

}

export function isFullUrl(url) {
	try {
		new URL(url)
		return true
	} catch (e) {
		return false
	}
}

export default function (eleventyConfig) {
	// Eleventy Image shortcode
	// https://www.11ty.dev/docs/plugins/image/
	eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, widths, sizes) {
		// Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
		// Warning: Avif can be resource-intensive so take care!
		let formats = ["avif", "webp", "auto"]
		let input
		if (isFullUrl(src)) {
			input = src
		} else {
			input = relativeToInputPath(this.page.inputPath, src)
		}

		let metadata = await eleventyImage(input, {
			widths: widths || ["auto"],
			formats,
			urlPath: "/images/",
			outputDir: path.join(eleventyConfig.dir.output, "images"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
		})

		// TODO loading=eager and fetchpriority=high
		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		}

		return eleventyImage.generateHTML(metadata, imageAttributes)
	})
}
