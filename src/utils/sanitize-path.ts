import * as path from 'path';

/**
 * cleanUP file path
 *
 * Transform path to file
 * If file name is index - removing index.js from path end
 * If file has a different name - removing only .js from path end
 * @example ./routes/index         => /
 * @example ./routes/path/index    => /path/
 * @example ./routes/someName      => /someName
 * @example ./routes/path/someName => /path/someName
 *
 * @param {string} fileName			 - File name
 * @param {string} filePath 		 - File path
 * @param {string} directoryPath - Path to dir with required files
 *
 * @returns {string}
 */
function sanitizePath(fileName: string, filePath: string, directoryPath: string): string {
	const fileExtension: string = path.extname(filePath);

	const start: number = directoryPath.length;
	const end  : number = fileName === 'index'
		? filePath.length - (fileName.length + fileExtension.length)
		: filePath.length - fileExtension.length;

	return filePath.slice(start, end);
}

export default sanitizePath;
