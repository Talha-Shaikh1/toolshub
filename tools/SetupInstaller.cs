using System;
using System.IO;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using Microsoft.Win32;

namespace FlowCreatorInstaller
{
    public class SetupForm : Form
    {
        private Label titleLabel;
        private Label subtitleLabel;
        private Label statusLabel;
        private ProgressBar progressBar;
        private Button installButton;
        private Button finishButton;
        private CheckBox launchCheckBox;
        private Panel headerPanel;
        private PictureBox iconBox;
        private bool isInstalled = false;

        public SetupForm()
        {
            this.Text = "FlowCreator Studio Pro — Setup Wizard";
            this.Size = new Size(580, 440);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(15, 23, 42); // Slate-900
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // Header Panel
            headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 85;
            headerPanel.BackColor = Color.FromArgb(10, 15, 30);

            iconBox = new PictureBox();
            iconBox.Size = new Size(54, 54);
            iconBox.Location = new Point(20, 15);
            iconBox.SizeMode = PictureBoxSizeMode.Zoom;
            
            // Try loading app icon
            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets", "app_icon.ico");
            if (File.Exists(iconPath))
            {
                try { iconBox.Image = Image.FromFile(iconPath); this.Icon = new Icon(iconPath); } catch { }
            }

            titleLabel = new Label();
            titleLabel.Text = "FlowCreator Studio Pro v2.1";
            titleLabel.Font = new Font("Segoe UI", 14f, FontStyle.Bold);
            titleLabel.ForeColor = Color.FromArgb(245, 158, 11); // Amber
            titleLabel.Location = new Point(85, 16);
            titleLabel.AutoSize = true;

            subtitleLabel = new Label();
            subtitleLabel.Text = "Hardware GPU Acceleration Engine • 0 MB Cloud Upload";
            subtitleLabel.Font = new Font("Segoe UI", 9f, FontStyle.Regular);
            subtitleLabel.ForeColor = Color.FromArgb(148, 163, 184); // Slate-400
            subtitleLabel.Location = new Point(87, 46);
            subtitleLabel.AutoSize = true;

            headerPanel.Controls.Add(iconBox);
            headerPanel.Controls.Add(titleLabel);
            headerPanel.Controls.Add(subtitleLabel);

            // Body content
            Label infoLabel = new Label();
            infoLabel.Text = "This setup wizard will install FlowCreator Studio Pro onto your computer.\n\n" +
                             "• Native Hardware GPU Video Rendering (Intel QSV / NVIDIA / AMD)\n" +
                             "• Word-by-word Alex Hormozi 2.0 animated boxed captions\n" +
                             "• Start Menu and Desktop Shortcuts integration\n" +
                             "• 100% Free & Self-Contained Desktop Experience";
            infoLabel.Location = new Point(28, 105);
            infoLabel.Size = new Size(510, 120);
            infoLabel.ForeColor = Color.FromArgb(226, 232, 240);

            statusLabel = new Label();
            statusLabel.Text = "Click 'Install' to begin.";
            statusLabel.Location = new Point(28, 240);
            statusLabel.Size = new Size(510, 24);
            statusLabel.ForeColor = Color.FromArgb(148, 163, 184);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(28, 270);
            progressBar.Size = new Size(508, 24);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Value = 0;

            launchCheckBox = new CheckBox();
            launchCheckBox.Text = "Launch FlowCreator Studio Pro immediately";
            launchCheckBox.Checked = true;
            launchCheckBox.Location = new Point(28, 305);
            launchCheckBox.Size = new Size(350, 25);
            launchCheckBox.ForeColor = Color.FromArgb(245, 158, 11);
            launchCheckBox.Visible = false;

            // Buttons
            installButton = new Button();
            installButton.Text = "Install FlowCreator Studio";
            installButton.Size = new Size(200, 36);
            installButton.Location = new Point(336, 345);
            installButton.BackColor = Color.FromArgb(245, 158, 11);
            installButton.ForeColor = Color.Black;
            installButton.FlatStyle = FlatStyle.Flat;
            installButton.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            installButton.Cursor = Cursors.Hand;
            installButton.Click += InstallButton_Click;

            finishButton = new Button();
            finishButton.Text = "Finish";
            finishButton.Size = new Size(110, 36);
            finishButton.Location = new Point(426, 345);
            finishButton.BackColor = Color.FromArgb(34, 197, 94);
            finishButton.ForeColor = Color.Black;
            finishButton.FlatStyle = FlatStyle.Flat;
            finishButton.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            finishButton.Cursor = Cursors.Hand;
            finishButton.Visible = false;
            finishButton.Click += FinishButton_Click;

            this.Controls.Add(headerPanel);
            this.Controls.Add(infoLabel);
            this.Controls.Add(statusLabel);
            this.Controls.Add(progressBar);
            this.Controls.Add(launchCheckBox);
            this.Controls.Add(installButton);
            this.Controls.Add(finishButton);
        }

        private void InstallButton_Click(object sender, EventArgs e)
        {
            installButton.Enabled = false;
            Timer timer = new Timer();
            timer.Interval = 120;
            int step = 0;

            string targetDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "FlowCreatorStudio");

            timer.Tick += (s, args) =>
            {
                step++;
                if (step == 2)
                {
                    statusLabel.Text = "Creating installation directory: " + targetDir;
                    progressBar.Value = 20;
                    try { Directory.CreateDirectory(targetDir); } catch { }
                }
                else if (step == 4)
                {
                    statusLabel.Text = "Deploying FlowCreator Studio executable & GPU engine...";
                    progressBar.Value = 50;

                    // Copy FlowCreator-Studio.exe
                    string sourceExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "FlowCreator-Studio.exe");
                    if (!File.Exists(sourceExe))
                        sourceExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "frontend", "public", "downloads", "FlowCreator-Studio.exe");

                    if (File.Exists(sourceExe))
                    {
                        try { File.Copy(sourceExe, Path.Combine(targetDir, "FlowCreator-Studio.exe"), true); } catch { }
                    }

                    // Copy icon
                    string sourceIcon = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets", "app_icon.ico");
                    if (File.Exists(sourceIcon))
                    {
                        try { File.Copy(sourceIcon, Path.Combine(targetDir, "app_icon.ico"), true); } catch { }
                    }
                }
                else if (step == 6)
                {
                    statusLabel.Text = "Creating Desktop & Start Menu Shortcuts...";
                    progressBar.Value = 75;

                    string exePath = Path.Combine(targetDir, "FlowCreator-Studio.exe");
                    string iconPath = Path.Combine(targetDir, "app_icon.ico");

                    // 1. Desktop Shortcut
                    try
                    {
                        string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                        CreateShortcut(Path.Combine(desktop, "FlowCreator Studio Pro.lnk"), exePath, iconPath, targetDir);
                    }
                    catch { }

                    // 2. Start Menu Shortcut
                    try
                    {
                        string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                        CreateShortcut(Path.Combine(startMenu, "FlowCreator Studio Pro.lnk"), exePath, iconPath, targetDir);
                    }
                    catch { }
                }
                else if (step == 8)
                {
                    statusLabel.Text = "Registering with Windows Apps & Features...";
                    progressBar.Value = 90;

                    try
                    {
                        using (var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\FlowCreatorStudio"))
                        {
                            if (key != null)
                            {
                                key.SetValue("DisplayName", "FlowCreator Studio Pro");
                                key.SetValue("DisplayVersion", "2.1.0");
                                key.SetValue("Publisher", "FlowCreator OS");
                                key.SetValue("DisplayIcon", Path.Combine(targetDir, "app_icon.ico"));
                                key.SetValue("InstallLocation", targetDir);
                                key.SetValue("UninstallString", "cmd.exe /c rd /s /q \"" + targetDir + "\"");
                            }
                        }
                    }
                    catch { }
                }
                else if (step >= 10)
                {
                    timer.Stop();
                    progressBar.Value = 100;
                    statusLabel.Text = "Installation Completed Successfully!";
                    statusLabel.ForeColor = Color.FromArgb(34, 197, 94); // Emerald
                    installButton.Visible = false;
                    finishButton.Visible = true;
                    launchCheckBox.Visible = true;
                    isInstalled = true;
                }
            };
            timer.Start();
        }

        private void FinishButton_Click(object sender, EventArgs e)
        {
            if (launchCheckBox.Checked)
            {
                string targetDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "FlowCreatorStudio");
                string exePath = Path.Combine(targetDir, "FlowCreator-Studio.exe");
                if (File.Exists(exePath))
                {
                    Process.Start(exePath);
                }
            }
            this.Close();
        }

        private static void CreateShortcut(string shortcutPath, string targetPath, string iconPath, string workingDir)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = workingDir;
                shortcut.Description = "FlowCreator Studio Pro - Hardware GPU Accelerated Reel Maker";
                if (File.Exists(iconPath))
                {
                    shortcut.IconLocation = iconPath + ",0";
                }
                shortcut.Save();
            }
            catch { }
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }
    }
}
