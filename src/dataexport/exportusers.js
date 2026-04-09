const { createObjectCsvStringifier } = require("csv-writer");

const exportUsersToCSV = async (req, res, results, functions) => {
  const exportItems = [];
  let total_records = 0;

  if (results && results.length > 0) {
    results.forEach((item, index) => {
      exportItems.push(item);
      total_records = index + 1;
    });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "user_firstname", title: "First Name" },
        { id: "user_lastname", title: "Last Name" },
        { id: "user_email", title: "Email" },
        { id: "active_status", title: "Active Status" },
        { id: "display_status", title: "Display Status" },
        { id: "created_at", title: "Created" },
      ],
    });

    // Summary rows
    let obj1 = {
      user_firstname: "",
      user_lastname: "",
    };
    let obj2 = {
      user_firstname: "Total Records",
      user_lastname: total_records,
    };
    exportItems.push(obj1);
    exportItems.push(obj2);
    
    functions.exportToCSV(
      req,
      res,
      exportItems,
      req.path.slice(1),
      csvStringifier,
    );
  }
};


module.exports = {
  exportUsersToCSV,
};