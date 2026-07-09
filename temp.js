router.post("/change-password", attachCommonData, async (req, res) => {
  try {
    const { user_id, user_email, password } = req.body;
    const encryptPass = bcrypt.hashSync(password, 10);

    // Escape values to prevent SQL injection (use with caution)
    const escapedPassword = encryptPass.replace(/'/g, "''");
    const escapedUserId = user_id.replace(/'/g, "''");
    const escapedEmail = user_email.replace(/'/g, "''");

    let sqlUpdate = updateQueries.updateChangePassword(escapedPassword,escapedUserId,escapedEmail);
    logToFile(common_functions.printQuery(sqlUpdate),"success");
    await common_functions.insertActionLog('UpdatedPassword',user_id,"users",user_id);
    const result = await query(sqlUpdate);

    const rowCount = result.rowCount || result.affectedRows || (result.rows ? result.rows.length : 0);

    if (rowCount === 0) {
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.INVALID_TOKEN_OR_EMAIL,
        data: [],
      });
    }

    let to = escapedEmail;
    let subject = "Password Changed Successfully - " + CONSTANTS.COMPANY_NAME;
    const html = `<tr>
        <td style="padding: 40px 40px 8px 40px;">
            <p
            style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; line-height: 32px; color:#1A1A1A;">
            Hello ${escapedEmail}.
            </p>
        </td>
        </tr>
        <tr>
        <td style="padding: 12px 40px 0 40px;">
            <p
            style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;">
            Your password changed on ${CONSTANTS.COMPANY_NAME}<br />
            </p>
            <p
            style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;">
            This is a confirmation that the password for your ${CONSTANTS.COMPANY_NAME} account was successfully updated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.
            </p>
            <p
            style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;"><b>If you performed this action:</b><br />No further action is required. You can continue to access your account as usual.</p>
            <p
            style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;">
            <b>If you did not perform this action:</b><br />If you did not request this change, please secure your account immediately or contact our support team.<br /><br />For your security, please ensure you use a strong, unique password for your account.
            </p>
        </td>
        </tr>
        <tr>
        <td style="padding: 32px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0"
            cellspacing="0">
            <tr>
                <td
                style="border-top: 1px solid #E5E0D5; font-size:0; line-height:0;">&nbsp;</td>
            </tr>
            </table>
        </td>
        </tr>`;
      await common_functions.sentAnEmail(to, subject, "", html);
    
    res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.PASSWORD_CHANGED_SUCCESSFULLY,
      data: { user_id },
    });
  } catch (error) {
    console.log("Error changing password:", error);
    res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: CONSTANTS.REQUEST_FAIL,
    });
  }
});