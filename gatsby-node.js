const pages = [
  "tvlist",
  "movielist"
];

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions;

  pages.forEach((item) => {
    if (page.path.match(new RegExp(`^\/${item}\/?`))) {
      page.matchPath = `/${item}/*`;
      createPage(page);
    }
  });
};
