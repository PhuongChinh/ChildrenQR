
"use strict";

const HAVE_TO_UPDATE_MODEL_FIRST = false;

module.exports = function (app) {

  if (HAVE_TO_UPDATE_MODEL_FIRST) {
    app.dataSources.db.autoupdate(
      ["AccessUser", "AccessToken", "ACL", "AccessRole", "AccRoleMapping",
        "Country", "Province", "District", "Ward",
        "AppContact",
        "School", "SchoolAddress", "Teacher", "SchoolTeacher", "Student", "Parent",
        "SchoolParentUser", "StudentUser", "TeacherUser",
      ],
      function (er) {
        console.log("Tables are updated!", er);
      }
    );
  }
};
