param($installPath, $toolsPath, $package, $project)

# Identify the parent directory for the currently running script
$scriptPath = split-path -parent $MyInvocation.MyCommand.Definition

# Then dot source the options
. (Join-Path $scriptPath common.ps1)

# Update the _references.js file
Remove-Reference $scriptsFolderProjectItem $jsFileNameRegEx