const url = require('url');

module.exports = function (options) {
	let opts = typeof options === 'function' ? { custom: options } : options;

	return async function (next) {
		let requestedUrl = url.parse((opts.useOriginalUrl ? this.originalUrl : this.url) || '', true);
		if (matchesCustom(this, opts) || matchesPath(requestedUrl, opts) ||
			matchesExtension(requestedUrl, opts) || matchesMethod(this.method, opts)) {
			return await next();
		}
		await next();
	};
};

function matchesCustom(ctx, opts) {
	if (opts.custom) {
		return opts.custom.call(ctx);
	}
	return false;
}

function matchesPath(requestedUrl, opts) {
	let paths = !opts.path || Array.isArray(opts.path) ?
		opts.path : [opts.path];

	if (paths) {
		return paths.some(function (p) {
			return (typeof p === 'string' && p === requestedUrl.pathname) ||
				(p instanceof RegExp && !!p.exec(requestedUrl.pathname));
		});
	}

	return false;
}

function matchesExtension(requestedUrl, opts) {
	let exts = !opts.ext || Array.isArray(opts.ext) ?
		opts.ext : [opts.ext];

	if (exts) {
		return exts.some(function (ext) {
			return requestedUrl.pathname.substr(ext.length * -1) === ext;
		});
	}
}

function matchesMethod(method, opts) {
	let methods = !opts.method || Array.isArray(opts.method) ?
		opts.method : [opts.method];

	if (methods) {
		return !!~methods.indexOf(method);
	}
}