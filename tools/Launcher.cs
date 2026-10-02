using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;

namespace FlowCreatorStudio
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                // Default target is the live studio
                string targetUrl = "https://01talha-arqa-chatbot.hf.space/studio";
                
                // If user has local server running on port 3000, prefer local GPU mode
                try
                {
                    var req = System.Net.WebRequest.Create("http://127.0.0.1:3000/studio");
                    req.Timeout = 800;
                    using (var resp = req.GetResponse())
                    {
                        targetUrl = "http://127.0.0.1:3000/studio";
                    }
                }
                catch
                {
                    // Fallback to live web studio
                }

                // Look for Edge or Chrome for dedicated App Mode window (no browser tabs / address bar)
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
                if (!File.Exists(edgePath))
                    edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");

                string chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
                if (!File.Exists(chromePath))
                    chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");

                ProcessStartInfo psi = new ProcessStartInfo();
                if (File.Exists(edgePath))
                {
                    psi.FileName = edgePath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1440,960", targetUrl);
                }
                else if (File.Exists(chromePath))
                {
                    psi.FileName = chromePath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1440,960", targetUrl);
                }
                else
                {
                    psi.FileName = targetUrl;
                    psi.UseShellExecute = true;
                }

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not launch FlowCreator Studio: " + ex.Message, "FlowCreator Studio Pro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
