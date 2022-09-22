
###########################################################################################################
Description
###########################################################################################################

Welcome to the PLOCCK readme! 

PLOCCK is an interactive app/visualization that utilizes real crime data from the city of Chicago to suggest ideal
locations for police departments. PLOCCK is unique in that it provides a simple user interface to interact with an 
underlying k-means algorithm to provide quick results for ideal police department locations. A subject matter expert can use 
the tool to select how many years worth of data they believe are relevant to department positioning and assign weights
to crimes that they understand may require quicker response times. Furthermore, locations can be pinned to force the algorithm
to provide a department at a specified location - with the rest of the department locations built around the fixed one(s).

The tool developed for this project is hosted on an AWS EC2 instance. 
The data is hosted on a MySQL server that runs from the EC2 instance.

These instructions cover all the steps required to deploy PLOCCK from scratch. Including creating the EC2 instance,
obtaining data / setting up the MySQL database, setting up the back end, and deploying the front end.

If you would like to use the EC2 instance already set-up by team113, all of the installation steps have been completed for you!
Just navigate to http://ec2-35-175-134-13.compute-1.amazonaws.com/ on any browser from any device.

###########################################################################################################
Installation
###########################################################################################################

-----------------------
EC2 Setup Instructions
-----------------------

Complete all steps below to setup the EC2 instance that will host PLOCCK and to prepare your computer to interact with the instance.

Setup EC2 instance - Assumes you already have an AWS account
1.  Navigate to the EC2 page from your AWS dashboard.
2.  Click "Launch Instance".
3.  Select the Amazon Linux 2 AMI (HVM), SSD Volume Type 64-bit instance AMI.
4.  On the next page, select the t2.micro instance type (free tier eligible). Click "Next: Configure Instance Details". 
5.  Leave all settings at default. Click "Next: Add Storage". 
6.  Change the 'Size (GiB)' text field to 30 (free tier eligible). Click "Next: Add Tags". 
7.  No need to add any tags. Click "Next: Configure Security Group". 
8.  In the "Type" dropdown select "All Traffic". In the "Source" dropdown select "Anywhere". Warning: Anything you put onto this instance is at risk as we are disabling security.
9.  Click "Review and Launch". Then click "Launch".
10. In the key pair pop-up window, select "Create a new key pair". Name it what you like under "Key pair name", for this example we will name it 'Team113Example'.
11. Download the Key Pair and save it in a known location.
12. Click "Launch Instance". Wait a few minutes for the setup to complete.

SSH to EC2 Instance - Assumes you are using windows, there are multiple ways to do this
1.  Download PuTTY (an SSH client) - https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
2.  Launch 'PuTTYgen' aka 'PuTTY Key Generator'
3.  Click 'Load'. Find your Key Pair file downloaded above (.pem) and press okay.
4.  In the 'Parameters' section select "SSH-1 (RSA)".
5.  Add a password if desired then click "Save private key" and save it to a known location.
6.  Open PuTTy.
7.  Obtain the host name from your AWS EC2 instance dashboard (e.g. ec2-34-207-155-92.compute-1.amazonaws.com). Enter it into 'Host Name' in PuTTY.
8.  On the left toolbar in PuTTY. Expand "Connection", click "Data". Put in the username (default: ec2-user).
9.  On the left toolbar. Expand "SSH", click "Auth". "Browse" and find the connection key that you saved in step 5 above.
10. Save the setup. On the left toolbar click "Session". Then put in a name in the "Saved Sessions" text field and click save.
11. Press open at the bottom right to open the connection.
12. The first time you connect you will get a message box, just press "Yes".
13. Put in your password if you set one in step 5.

Upload files to EC2 Instance - Assumes you are using windows, there are multiple ways to do this
1.  Download and install WinSCP https://winscp.net/eng/index.php
2.  Select "New Site" on the left navigation bar.
3.  Select "SCP" under "File protocol"
4.  Put the host name for your instance (e.g. ec2-34-207-155-92.compute-1.amazonaws.com)
5.  Put in the username (default: ec2-user).
6.  Click "Advanced" then "Authentication" on the left tool bar.
7.  Under "Private key file", browse for the key file saved in step 5 from the 'SSH to EC2 Instance' instructions above. Press "Okay".
6.  Click "Login". In the pop-up window, click "Yes".
7.  You can now copy over files from your local computer (left-window) to the EC2 instance (right-window).

Install anaconda on EC2 (more details: https://wszhan.github.io/2018/04/09/installing-anaconda-on-ec2.html)
1.  Connect to the EC2 instance.
2.  Execute "cd ~". Execute "wget https://repo.anaconda.com/archive/Anaconda3-2020.11-Linux-x86_64.sh" to download anaconda
3.  Execute "cd ~". Execute "bash Anaconda3-2020.11-Linux-x86_64.sh" to install anaconda. Follow the directions to complete the installation.
4.  Execute "conda install boto3"
5.  Execute "conda install flask_cors"
6.  Execute "conda install pymysql"


-----------------------
Database (MySQL) Setup Instructions
-----------------------

Obtain the Data - Save all files to the same location
1.  Download the crime data: https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-Present/ijzp-q8t2 (export as csv)
    Ensure this file is named: Crimes_-_2001_to_Present.csv
2.  Download existing Chicago police departments data: https://clearmap-chicagopd.hub.arcgis.com/datasets/police-district-stations-view?geometry=-88.974%2C41.666%2C-86.361%2C42.025 (download as csv)
    Ensure this file is named: Police_District_Stations_View.csv
3.  Download the IUCR codes table: https://data.cityofchicago.org/Public-Safety/Chicago-Police-Department-Illinois-Uniform-Crime-R/c7ck-438e (export as csv)
    Ensure this file is named: Chicago_Police_Department_-_Illinois_Uniform_Crime_Reporting__IUCR__Codes.csv

Setup the MySQL database on EC2 
(Details: https://techviewleo.com/how-to-install-mysql-8-on-amazon-linux-2/)
1.  SSH onto the EC2. Ensure you are at the home directory by executing "cd ~"
2.  Execute "sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm"
3.  Execute "sudo amazon-linux-extras install epel -y"
4.  Execute "sudo yum install mysql-community-server" to install the server
5.  Execute "sudo systemctl enable --now mysqld" to start the server
6.  Execute "systemctl status mysqld" to confirm the server is operational
7.  Execute "sudo grep 'temporary password' /var/log/mysqld.log" to get the temporary password
8.  Execute "sudo mysql_secure_installation -p'yourpassword'" replace yourpassword with your temporary password from step 6
9.  Set a new password - has strict requirements. When prompterd, change the password for root as well.
10. When prompted, no need to remove anonymous users and no need to disallow root login remotely. Select 'y' for "reload priveledge tables.
11. Connect the MySQL server by executing "mysql -uroot -p". Enter your password.
12. Execute "CREATE DATABASE ploc;" then "USE ploc;" to create and select the PLOC database.
13. Execute "CREATE USER 'team113'@'localhost' IDENTIFIED BY 'team113Rules!';"
14. Execute "GRANT ALL PRIVILEGES ON * . * TO 'team113'@'localhost';"
15. Execute "CREATE USER 'team113'@'%' IDENTIFIED BY 'team113Rules!';"
16. Execute "GRANT ALL PRIVILEGES ON * . * TO 'team113'@'%';"
17. Execute "FLUSH PRIVILEGES;" to complete setting up the users/priveleges.

Setup the MySQL Data Tables
1.  Open ploc_db/CreateMySQLDB.py
2.  At the bottom of the script, edit the path to your locally save data files downloaded above in the 'Obtain the Data' instructions
2.  At the bottom of the script, edit the sql server settings to reflect the server/EC2 you created above.
3.  Run the script, it may take up ~1 hour to finish building the tables.


-----------------------
Back End Setup Instructions
-----------------------

1.  Open ploc_be/main.py
2.  Ensure app.run() is commented out and app.run(port=80, host='0.0.0.0') is un-commented to run on EC2
    (other way around for local dev work)
3.  Ensure the sql_hostname is pointing towards the correct EC2 instance.
3.  Copy ploc_be code onto EC2 into the /home/ec2-user folder
    See 'Upload files to EC2 Instance' instructions above if help is needed


-----------------------
Front End Setup Instructions
-----------------------
1.  Download and install nodejs LTS: https://nodejs.org/en/
2.  Download and install yarn: https://yarnpkg.com/getting-started/install
    Execute 'npm install -g yarn' on a local command line
3.  On your local computer, open a shell and navigate to ./ploc_fe
4.  Execute 'yarn' to install dependencies
5.  Execute 'yarn build' to compile the front end
6.  Once compiled, in the ./ploc_fe folder a build folder will appear with all assets needed to deploy the front end
7.  Open ./ploc_fe/build/index.html in an editor. Update the paths for the following files:
    /favicon.ico                    -> /static/favicon.ico
    /logo192.png                    -> /static/logo192.png
    /manifest.json                  -> /static/manifest.json
    /static/main.XXXXX.chunk.css    -> /static/static/main.XXXXX.chunk.css
    /static/js/XXXXX.chunk.js       -> /static/static/js/XXXXX.chunk.js
    /static/js/main.XXXXX.chunk.js  -> /static/static/js/main.XXXXX.chunk.js
8.  Copy all contents from ./ploc_fe/build/ into ploc_be/static/


-----------------------
Launch PLOCCK
-----------------------

1. SSH into EC2 (see "SSH to EC2 Instance" instructions above)
2. Navigate to backend folder "cd /home/ec2-user/ploc_be"
3. Execute "sudo /home/ec2-user/anaconda3/bin/python3.8 main.py"
4. In any browser (on any device), navigate to the EC2 host URL (e.g. http://ec2-35-175-134-13.compute-1.amazonaws.com/) 


-----------------------
Important Info for the EC2 that team113 already setup
-----------------------

Host URL: http://ec2-35-175-134-13.compute-1.amazonaws.com/
IPv4: 35.175.134.13
EC2 Username: ec2-user
MySQL Username: team113
MySQL Password: team113Rules!



###########################################################################################################
Execution
###########################################################################################################

After completing the setup process above and deploying the app, the instructions below describe how to use it.

If you do not want to set up your own version of the app, the following URL has a live version that team 113 deployed:
http://ec2-35-175-134-13.compute-1.amazonaws.com/

After navigating to the URL, PLOCCK is ready for use. Follow the instructions below for a simple demo.

1. Select a date range of interest - only crimes that occured within this date range will be used when determining ideal police department locations.
2. Select the desired number of departments - this is the number of location reccomendations that PLOCCK will return.
3. Set crime weights - the user can select which crimes are most important when determining department locations and crimes that are not important can be left out entirely.
4. (Optional) Double click any point on the map to pin or unpin a locations. Pinning locations will force the algorithm to determine other optimal locations considering some are fixed.
5. Click "Apply". Results will be returned in 1-2 minutes.
6. Select optional overlays to view. Options include existing department locations, existing districts, and 'suggested' districts (determined by a simplistic Voronoi method).



