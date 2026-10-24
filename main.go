package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// The maintained submission engine lives in ok.js. This small Go entry point
// is kept as a convenient launcher for users who previously invoked main.go.
func main() {
	workingDir, err := os.Getwd()
	if err != nil {
		fmt.Fprintln(os.Stderr, "Could not determine the working directory:", err)
		os.Exit(1)
	}

	script := filepath.Join(workingDir, "ok.js")
	if _, err := os.Stat(script); err != nil {
		fmt.Fprintln(os.Stderr, "ok.js was not found in the current directory")
		os.Exit(1)
	}

	command := exec.Command("node", script)
	command.Stdin = os.Stdin
	command.Stdout = os.Stdout
	command.Stderr = os.Stderr
	if err := command.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "Node.js submission engine failed:", err)
		os.Exit(1)
	}
}
