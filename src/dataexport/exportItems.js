const { createObjectCsvStringifier } = require("csv-writer");

const exportItemsToCSV = async (req, res, results, functions) => {
  const exportItems = [];
  let total_records = 0;

  if (results && results.length > 0) {
    results.forEach((item, index) => {
      exportItems.push(item);
      total_records = index + 1;
    });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "item_title", title: "Title" },
        { id: "item_alias", title: "Alias" },
        { id: "item_type", title: "Type" },
        { id: "item_sections_id", title: "Category" },
        { id: "item_description", title: "Description" },
        { id: "attachment1", title: "File" },
        { id: "item_shortdescription", title: "Short Description" },
        { id: "display_status", title: "Display Status" },
        { id: "created_at", title: "Created" },
      ],
    });

    // Add summary rows
    exportItems.push({
      item_title: "",
      item_alias: "",
    });

    exportItems.push({
      item_title: "Total Records",
      item_alias: total_records,
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
  exportItemsToCSV,
};