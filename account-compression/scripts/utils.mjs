import "zx/globals";

process.env.FORCE_COLOR = 3;
process.env.CARGO_TERM_COLOR = "always";

export const workingDirectory = (await $`pwd`.quiet()).toString().trim();
