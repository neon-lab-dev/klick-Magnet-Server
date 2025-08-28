export const processTags = (tags) => {
  return tags[0]
    .split(",")
    .map((str) => str.trim().replace(/(^"|"$)/g, ""));
};
