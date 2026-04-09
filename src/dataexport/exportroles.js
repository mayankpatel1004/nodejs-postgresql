const { createObjectCsvStringifier } = require("csv-writer");

const exportRolesToCSV = async (req, res, results, functions) => {
  const exportItems = [];
  let total_records = 0;

  if (results && results.length > 0) {
    results.forEach((item, index) => {
      exportItems.push(item);
      total_records = index + 1;
    });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "role_title", title: "Role Title" },
        { id: "role_alias", title: "Role Alias" }, // ✅ fixed
        { id: "display_status", title: "Display Status" },
        { id: "created_at", title: "Created" },
      ],
    });

    // Summary rows
    exportItems.push({
      role_title: "",
      role_alias: "",
    });

    exportItems.push({
      role_title: "Total Records",
      role_alias: total_records,
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
  exportRolesToCSV,
};