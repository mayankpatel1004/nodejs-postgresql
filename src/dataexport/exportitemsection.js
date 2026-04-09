const { createObjectCsvStringifier } = require("csv-writer");

const exportItemSectionToCSV = async (req, res, results, functions) => {
  const exportItems = [];
  let total_records = 0;

  if (results && results.length > 0) {
    results.forEach((item, index) => {
      exportItems.push(item);
      total_records = index + 1;
    });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "section_title", title: "Title" },
        { id: "section_alias", title: "Alias" },
        { id: "item_type", title: "Type" },
        { id: "description", title: "Description" },
        { id: "display_status", title: "Display Status" },
        { id: "created_at", title: "Created" },
      ],
    });

    // Summary rows
    exportItems.push({
      section_title: "",
      section_alias: "",
    });

    exportItems.push({
      section_title: "Total Records",
      section_alias: total_records,
    });

    return functions.exportToCSV(
      req,
      res,
      exportItems,
      req.path.slice(1),
      csvStringifier
    );
  }
};

module.exports = {
  exportItemSectionToCSV,
};