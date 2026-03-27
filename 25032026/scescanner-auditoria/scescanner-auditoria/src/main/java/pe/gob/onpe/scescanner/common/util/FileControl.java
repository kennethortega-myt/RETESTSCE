package pe.gob.onpe.scescanner.common.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.CopyOption;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.stream.Stream;


public class FileControl {
    
    private FileControl(){
    }

    
    public static boolean fileMoveNIO(String sourceFile, String destinationFile) {
        try {

            Path from = Paths.get(sourceFile);
            Path to = Paths.get(destinationFile);
            CopyOption[] options = new CopyOption[]{
                StandardCopyOption.REPLACE_EXISTING
            };
            java.nio.file.Files.move(from, to, options);
            return true;
        } catch (IOException ex) {
            return false;
        }
    }
    
    public static boolean fileCopyNIO(String sourceFile, String destinationFile) {
        try {

            Path from = Paths.get(sourceFile);
            Path to = Paths.get(destinationFile);
            CopyOption[] options = new CopyOption[]{
                StandardCopyOption.REPLACE_EXISTING
            };
            java.nio.file.Files.copy(from, to, options);
            return true;
        } catch (IOException ex) {
            return false;
        }
    }

    public static boolean validateDir(String path, boolean action) {
        File file = new File(path);
        boolean isDirectory = file.isDirectory();
        
        if (action && !file.exists()) {
            return file.mkdirs();
        }
        return isDirectory;
    }

    public static boolean validateFile(String path) {
        File file = new File(path);
        return file.exists();
    }

    public static boolean deleteChildren(String pathStr) {
        Path dir = Paths.get(pathStr);
        if (!Files.exists(dir)) {
            return false;
        }

        if (!Files.isDirectory(dir)) {
            try {
                Files.delete(dir);
                return true;
            } catch (IOException e) {
                return false;
            }
        }
        return FileControl.deleteChildren(dir);
    }
    
    private static boolean deleteChildren(Path dir) {
        boolean allDeleted = true;

        try (Stream<Path> children = Files.list(dir)) {
            for (Path child : children.toList()) {
                if (Files.isDirectory(child) && !FileControl.deleteChildren(child)) {
                    allDeleted = false;
                }
                if (Files.exists(child) && !deleteFile(child)) {
                    allDeleted = false;
                }
            }
        } catch (IOException e) {
            return false;
        }

        return allDeleted;
    }
    
    private static boolean deleteFile(Path file) {
        try {
            Files.delete(file);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
    
    public static boolean deleteWithChildren(String path) {
        Path dir = Paths.get(path);
        if (!Files.exists(dir)) {
            return false;
        }
        try {
            Files.walkFileTree(dir, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.delete(file);
                    return FileVisitResult.CONTINUE;
                }
                
                @Override
                public FileVisitResult postVisitDirectory(Path directory, IOException exc) throws IOException {
                    Files.delete(directory);
                    return FileVisitResult.CONTINUE;
                }
            });
            return true;
        } catch (IOException e) {
            return false;
        }
    }
    

    public static void copyRecursively(Path fromPath, Path toPath, CopyOption[] options) throws IOException {
        File oToPath = new File(toPath.toString());

        if (!oToPath.exists() && !oToPath.mkdir()) {
            throw new IOException("No se pudo crear el directorio: " + toPath);
        }

        File oFromPath = new File(fromPath.toString());

        File[] contentPath = oFromPath.listFiles();
        
        if (contentPath == null) {
            return;
        }

        for (File contentPath1 : contentPath) {
            if (contentPath1.isFile()) {
                Files.copy(Paths.get(fromPath.toString(), contentPath1.getName()), Paths.get(toPath.toString(), contentPath1.getName()), options);
            } else {
                copyRecursively(Paths.get(fromPath.toString(), contentPath1.getName()), Paths.get(toPath.toString(), contentPath1.getName()), options);
            }
        }
    }
    
}
