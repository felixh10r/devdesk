# devDesk

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

The app will by default run at [http://localhost:1337](http://localhost:1337).

## Adding as a launch agent

```sh
touch ~/Library/LaunchAgents/at.scale.devdesk.plist
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>at.scale.devdesk</string>
	<key>KeepAlive</key>
	<true/>
	<key>WorkingDirectory</key>
    <string>PATH_TO_PROGRAM_DIRECTORY</string>
	<key>ProgramArguments</key>
	<array>
		<string>./start.sh</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>EnvironmentVariables</key>
	<dict>
		<key>PATH</key>
		<string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
	</dict>
</dict>
</plist>
```

```sh
launchctl load ~/Library/LaunchAgents/at.scale.devdesk.plist
launchctl start at.scale.devdesk
```

## Reloading the launch agent

```sh
launchctl unload ~/Library/LaunchAgents/at.scale.devdesk.plist
launchctl load ~/Library/LaunchAgents/at.scale.devdesk.plist
launchctl start at.scale.devdesk
```

Recommended: Add a bookmark to http://localhost:1337