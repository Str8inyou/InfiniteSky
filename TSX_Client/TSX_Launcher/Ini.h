// This file is part of InfiniteSky.
// Copyright (c) InfiniteSky Dev Teams - Licensed under GNU GPL
// For more information, see LICENCE in the main folder

// [Liam Mitchell] I made this ages ago feel free to use it in anything you like.

#ifndef __INI__H
#define __INI__H

#include "stdafx.h"

#ifndef string_trim
#define string_trim
static const std::string trim(const std::string& pString,const std::string& pWhitespace = " \t\"\'")
{
	const size_t beginStr = pString.find_first_not_of(pWhitespace);
	if (beginStr == std::string::npos)
	{
		// no content
		return "";
	}

	const size_t endStr = pString.find_last_not_of(pWhitespace);
	const size_t range = endStr - beginStr + 1;

	return pString.substr(beginStr, range);
}
#endif

class Ini_Section
{
private:
	string Name;
	map<string,string> Options;
public:
	Ini_Section();
	Ini_Section(string _Name)
	{
		SetName(_Name);
	};
	~Ini_Section()
	{
		Clear();
	};
	void SetName(string _Name)
	{
		Name=_Name;
	}
	string GetName()
	{
		return Name;
	}
	void Add(string Key,string Value)
	{
		//Options.insert(Key,Value);
		Options[Key]=Value;
	};
	void Add(string Key,int Value)
	{		
		stringstream MyStream;
		MyStream << Value;
		Options[Key]=MyStream.str();
		//Options.insert(Key,MyStream.str());
	};
	void Add(string Key,unsigned int Value)
	{		
		stringstream MyStream;
		MyStream << Value;
		Options[Key]=MyStream.str();
		//Options.insert(Key,MyStream.str());
	};
	string GetString(string Key,string Default="")
	{		
		map<string,string>::iterator it;
		if (Options.count(Key)>0)
		{		
			it = Options.find(Key);
		}
		else
		{
			// Comment to remove adding if the key does not exist
			Add(Key,Default);
			return Default;
		}
		return it->second;
	};
	unsigned int GetUInt(string Key,unsigned int Default=0)
	{
		map<string,string>::iterator it;
		if (Options.count(Key)>0)
		{		
			it = Options.find(Key);
		}
		else
		{
			// Comment to remove adding if the key does not exist
			Add(Key,Default);
			return Default;
		}

		return (unsigned int)atoi(it->second.c_str());
	};
	int GetInt(string Key,int Default=0)
	{
		map<string,string>::iterator it;
		if (Options.count(Key)>0)
		{		
			it = Options.find(Key);
		}
		else
		{
			// Comment to remove adding if the key does not exist
			Add(Key,Default);
			return Default;
		}

		return atoi(it->second.c_str());
	};
	void Remove(string Key)
	{
		map<string,string>::iterator it = Options.find(Key);
		Options.erase(it);
	};
	void Clear()
	{
		Options.clear();
	};
	string Save()
	{
		stringstream Data;
		Data << "[" << Name << "]\r\n";
		for (map<string,string>::iterator it = Options.begin();it!=Options.end();it++)
		{		
			Data << it->first << "=" << it->second << "\r\n";
		}
		Data << "\r\n";
		return Data.str();
	};
};

class Ini
{
private:
	vector<Ini_Section*> Sections;
	string FileName;
	Ini_Section* Section;
	bool Changed;
public:
	Ini()
	{
		Section=0;
		Changed=false;
	};
	Ini(string _FileName)
	{
		Section=0;
		SetFileName(_FileName);		
		Parse();
		Changed=false;
	};
	~Ini()
	{
		Clear();
	};
	void SetFileName(string _FileName)
	{
		FileName=_FileName;
	};
	void Clear()
	{
		for (vector<Ini_Section*>::iterator it=Sections.begin();it!=Sections.end();it++)
		{
			delete (*it);
		}
		Sections.clear();
	};
	void Parse()
	{
		Clear();
		// Open the file and parse it and all that
		fstream File;
		File.open(FileName.c_str(),ios_base::in);
		if (!File.is_open())
		{
			// throw an exception that file is not open
			return;
		}
		// Get file size
		// 		File.seekg(0,ios::end);
		// 		size_t FileSize=File.tellg();
		// 		File.seekg(0,ios::beg);		
		char Line[255];
		// Remove the \r if its there.
		while (!File.eof())
		{			
			File.getline(Line,255,'\n');
			if (Line[strlen(Line)]=='\r')
			{
				Line[strlen(Line)]=0x00;
			}
			if (File.fail())
			{
				// throw exception for invalid size data maybe?
				// Can increase the size of Line to compensate not that an ini file should need more than 255 chars for a option.
			}
			if (Line[0]=='[')
			{
				// Its a section
				string SectionName=Line;
				//SectionName = SectionName.substr(1);
				//SectionName = SectionName.substr(0,SectionName.length()-2);
				SectionName=trim(SectionName," \t[]");
				Add(SectionName);
			}
			else if (Line[0]==';')
			{
				// Comment just ignore...
				// Im not going to bother with preserving or saving comments back into ini files.
				// As I don't think comments should be left in release ini files.
			}
			else
			{
				// Its either a key value or a blank line
				// Check for =
				string TheLine=Line;
				size_t Seperator = TheLine.find("=");
				if (Seperator!=string::npos)
				{
					// = found in TheLine

					string Key=trim(TheLine.substr(0,Seperator));
					string Value=trim(TheLine.substr(Seperator+1));
					// For debugging purpouses
					//cout << Key << " = " << Value << endl;
					Add(Key,Value);
				}
				else
				{
					// = was not found so will consider this line blank.
				}
			}
		}
		File.close();
	};
	void Save()
	{
		fstream File;
		File.open(FileName.c_str(),ios_base::out);
		if (!File.is_open())
		{
			// throw an exception that file is not open
		}
		// Iterate through all sections saving them to the file
		File << "; Generated by Liam Mitchell's ini class\r\n";
		for (vector<Ini_Section*>::iterator it=Sections.begin();it!=Sections.end();it++)
		{
			//output this to the file						
			string Data = (*it)->Save();
			File << Data.c_str();
		}
		File.close();
	};
	void SetSection(string SectionName)
	{	
		Section=0;
		for (vector<Ini_Section*>::iterator it=Sections.begin();it!=Sections.end();it++)
		{
			if ((*it)->GetName()==SectionName)
			{			
				Section=*it;
				break;
			}
		}
		if (Section==0)
		{
			// Comment out to remove adding new section if it does not exist.
			// Add new section
			Add(SectionName);
		}
	};
	string GetString(string Key,string Default="")
	{
		if (Section==0)
		{
			Add("Default");
		}
		return Section->GetString(Key,Default);
	};
	unsigned int GetUInt(string Key,unsigned int Default=0)
	{
		if (Section==0)
		{
			Add("Default");
		}
		return Section->GetUInt(Key,Default);
	};
	int GetInt(string Key,int Default=0)
	{
		if (Section==0)
		{
			Add("Default");
		}
		return Section->GetInt(Key,Default);
	};
	void Add(string Key,string Value)
	{
		if (Changed==false)
		{
			Changed=true;
		}
		if (Section==0)
		{
			Add("Default");
		}
		return Section->Add(Key,Value);
	}
	void Add(string Key,int Value)
	{
		if (Changed==false)
		{
			Changed=true;
		}
		if (Section==0)
		{
			Add("Default");
		}
		return Section->Add(Key,Value);
	}
	void Add(string SectionName)
	{
		if (Changed==false)
		{
			Changed=true;
		}
		Ini_Section* NewSection = new Ini_Section(SectionName);
		Sections.push_back(NewSection);
		SetSection(SectionName);
	}
	bool GetChanged()
	{
		return Changed;
	}
};

#endif // __INI__H