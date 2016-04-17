param($installPath, $toolsPath, $package, $project)

# Identify the parent directory for the currently running script
$scriptPath = split-path -parent $MyInvocation.MyCommand.Definition

# Then dot source the options
. (Join-Path $scriptPath common.ps1)

if ($scriptsFolderProjectItem -eq $null) {
    # No Scripts folder
    Write-Host "No Scripts folder found"
    exit
}

# Update the _references.js file
AddOrUpdate-Reference $scriptsFolderProjectItem $jsFileNameRegEx $jsFilePath