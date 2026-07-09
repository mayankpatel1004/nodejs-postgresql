function emailHeader($title = 'Notification')
{
    global $site_url,$pdo;
    $website_name = "";
    $sqlQuery = "SELECT config_value FROM `site_config` WHERE `config_name` IN ('FRONT_APPLICATION_TITLE')";
    $arrConfigDetails = sqlSelect($sqlQuery, PDO::FETCH_ASSOC);
    if (!empty($arrConfigDetails)) {
        $website_name = $arrConfigDetails[0]['config_value'];
    }
    return '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>'.$title.'</title>
  </head>
  <body style="margin:0; padding:0; font-family: Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0"
            style="width:600px; max-width:600px; background-color:#FFFFFF;border:1px solid #ccc; border-radius:4px; overflow:hidden;">
            <tr>
              <td style="background-color:#162447; padding: 36px 40px;">
                <table role="presentation" width="100%" cellpadding="0"
                  cellspacing="0">
                  <tr>
                    <td align="center" valign="middle">
                      <span
                        style="font-family: Georgia, \'Times New Roman\', serif; font-size: 22px; color: #FFFFFF; letter-spacing: 0.5px;">
                        '.$website_name.'
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td
                style="background-color:#B8A369; height: 4px; line-height:4px; font-size:0;">&nbsp;</td>
            </tr>';
}

function emailFooter()
{
    global $site_url,$pdo;
    $website_name = "";
    $company_address = "";
    $company_contact = "";
    $company_email = "";
    $company_city = "";
    $company_state = "";
    $company_country = "";
    $company_zipcode = "";
    $sqlQuery = "SELECT config_value FROM `site_config` WHERE `config_name` IN ('FRONT_APPLICATION_TITLE','COMPANY_NAME','COMPANY_ADDRESS1','COMPANY_ADDRESS2','COMPANY_CITY','COMPANY_STATE','COMPANY_COUNTRY','COMPANY_ZIPCODE','COMPANY_CONTACT_NUMBER','COMPANY_EMAIL')";
    $arrConfigDetails = sqlSelect($sqlQuery, PDO::FETCH_ASSOC);
    if (!empty($arrConfigDetails)) {
        $website_name = $arrConfigDetails[0]['config_value'];
        $company_address = $arrConfigDetails[2]['config_value']." ".$arrConfigDetails[3]['config_value'];
        $company_city = $arrConfigDetails[4]['config_value'];
        $company_state = $arrConfigDetails[5]['config_value'];
        $company_country = $arrConfigDetails[6]['config_value'];
        $company_zipcode = $arrConfigDetails[7]['config_value'];
        $company_contact = $arrConfigDetails[8]['config_value'];
        $company_email = $arrConfigDetails[9]['config_value'];
    }
    return '
                        <tr>
                            <td bgcolor="#162447"
                                style="padding:20px;text-align:center;color:#FFF;font-size:12px;">
                                <strong>'.$website_name.'</strong><br>
                                '.$company_address.'<br>
                                Email: '.$company_email.'<br>
                                Phone: '.$company_contact.'<br>
                                &copy; '.date('Y').' '.$website_name.' . All Rights Reserved.
                            </td>
                        </tr></table>
        </td>
      </tr>
    </table>

  </body>
</html>';
}