using System;
using System.IO;
using System.Diagnostics;
using System.Threading;
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
                string targetUrl = null;
                
                // 1. Check if local GPU engine is already running on port 8000
                if (IsUrlAvailable("http://127.0.0.1:8000/studio"))
                {
                    targetUrl = "http://127.0.0.1:8000/studio";
                }
                // 2. Check if local frontend dev server is running on port 3000
                else if (IsUrlAvailable("http://127.0.0.1:3000/studio"))
                {
                    targetUrl = "http://127.0.0.1:3000/studio";
                }
                else
                {
                    // 3. Try to auto-start local GPU engine on this computer if repo exists
                    string[] possiblePaths = new string[]
                    {
                        @"C:\Work\reel-caption-tool\backend",
                        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "backend"),
                        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\backend")
                    };

                    string backendPath = null;
                    foreach (var p in possiblePaths)
                    {
                        if (File.Exists(Path.Combine(p, "main.py")))
                        {
                            backendPath = Path.GetFullPath(p);
                            break;
                        }
                    }

                    if (backendPath != null)
                    {
                        try
                        {
                            ProcessStartInfo uvicornPsi = new ProcessStartInfo();
                            uvicornPsi.FileName = "cmd.exe";
                            uvicornPsi.Arguments = "/c python -m uvicorn main:app --host 127.0.0.1 --port 8000";
                            uvicornPsi.WorkingDirectory = backendPath;
                            uvicornPsi.CreateNoWindow = true;
                            uvicornPsi.UseShellExecute = false;
                            uvicornPsi.WindowStyle = ProcessWindowStyle.Hidden;
                            Process.Start(uvicornPsi);

                            // Wait up to 3 seconds for server to bind
                            for (int i = 0; i < 6; i++)
                            {
                                Thread.Sleep(500);
                                if (IsUrlAvailable("http://127.0.0.1:8000/studio"))
                                {
                                    targetUrl = "http://127.0.0.1:8000/studio";
                                    break;
                                }
                            }
                        }
                        catch { }
                    }
                }

                // 4. Fallback to cloud studio if local engine unavailable
                if (string.IsNullOrEmpty(targetUrl))
                {
                    targetUrl = "https://01talha-arqa-chatbot.hf.space/studio";
                }

                // 5. Launch dedicated App Mode window (No browser address bar or tabs)
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

        static bool IsUrlAvailable(string url)
        {
            try
            {
                var req = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
                req.Timeout = 900;
                req.Method = "GET";
                using (var resp = (System.Net.HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == System.Net.HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
