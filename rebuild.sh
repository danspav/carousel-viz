#!/bin/bash
export SPLUNK_HOME=/opt/splunk

 bump=`cat $SPLUNK_HOME/var/run/splunk/push-version.txt`
 echo "Current version: $bump"
 let bump++
 echo -n $bump > $SPLUNK_HOME/var/run/splunk/push-version.txt
 echo "New version:  $bump"

cd /opt/git/carousel-viz/carousel-viz
git pull
cd /opt/git/carousel-viz/carousel-viz/appserver/static/visualizations/carousel-viz
npm run build
rm -r /opt/splunk/etc/apps/carousel-viz
mkdir /opt/splunk/etc/apps/carousel-viz
cp -R /opt/git/carousel-viz/carousel-viz /opt/splunk/etc/apps/carousel-viz
chown -R splunk:splunk /opt/splunk
/opt/splunk/bin/splunk restart

